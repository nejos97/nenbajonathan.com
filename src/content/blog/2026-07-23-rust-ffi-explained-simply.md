---
author: Jonathan Nenba
pubDatetime: 2026-08-03T10:00:00Z
title: 'Rust FFI, Explained Simply'
slug: rust-ffi-explained-simply
featured: false
draft: false
tags:
    - rust
    - ffi
    - c
    - systems-programming
    - software-engineer
description: FFI (Foreign Function Interface) scares a lot of beginner Rust developers. Here is a simple explanation, with concrete examples, of how Rust can talk to C code.
---

A few weeks ago, I had to get `sifir-rs-sdk`, a Rust SDK built on top of Tor, running on my simulator (iOS). Between the cascading compilation errors and the toolchain headaches, I landed right back on a topic most Rust developers avoid for as long as they can: FFI.

The word sounds intimidating. It sounds complicated. And yet, once you understand the basic idea, it is not that hard. It is actually a topic every serious Rust developer ends up running into, especially if you work close to cryptography, network protocols, or system libraries, which is exactly where I sit with [Grimm App (Open-source Bitcoin & Lightning Wallet)](https://usegrimm.app).

In this post, I will explain FFI in plain terms, with concrete examples, no unnecessary jargon. All commands and outputs below were run on **macOS (Apple Silicon)**.

## What is FFI?

FFI stands for "Foreign Function Interface." In plain words: it is a mechanism that lets code written in one language (Rust, for example) call code written in another language (C, for example), and the other way around too.

Why C specifically? Because C has a very stable, well-defined way of calling functions, known as the ABI (Application Binary Interface). Almost every language knows how to "speak C" at the binary level. So if Rust can talk to C, it can indirectly talk to a lot of other languages too.

## Why should you care?

Here are a few concrete reasons to use FFI in Rust.

**Reusing existing libraries.** There are thousands of mature, battle-tested C libraries out there, refined over decades. You do not need to rewrite them in Rust. You can call them directly.

**Keeping performance-critical code in C or C++.** Some libraries are extremely optimized for one specific job. Instead of rewriting all of it, you plug it into Rust through FFI.

**Migrating a codebase gradually.** If you have an old C codebase, you can rewrite it piece by piece in Rust, and let both live side by side through FFI, without breaking everything at once.

This comes up constantly in the Bitcoin ecosystem. A lot of cryptographic primitives, like `libsecp256k1`, are written in C and used by most implementations, including several Rust libraries.

## The basic vocabulary

Before writing any code, here are the words you need to know.

**`extern "C"`**: tells Rust "this function follows C's calling rules." It is a contract between Rust and the outside world.

**`unsafe`**: the Rust compiler cannot check anything on the other side of the bridge, in C. Declaring foreign functions and calling them both require explicit `unsafe` — more on that below.

**`#[unsafe(no_mangle)]`**: by default, Rust changes function names internally (this is called "name mangling"). This attribute tells Rust to keep the name as-is, so C code can find it at link time. In Rust 2024, it must be written as `#[unsafe(no_mangle)]` rather than the older `#[no_mangle]`.

**ABI**: the exact way data is laid out in memory and functions are called, at the binary level. It is what allows two different languages to understand each other once compiled.

## Example 1: Rust calls a C function

Let's start simple. The C standard library (`libc`) is already linked by default to every Rust program on macOS. So you can call one of its functions without installing anything.

```rust
// src/main.rs
unsafe extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    let x = -42;
    let y = unsafe { abs(x) };
    println!("Absolute value of {} is {}", x, y);
}
```

What this code does:

1. The `unsafe extern "C" { ... }` block declares that a function called `abs` exists somewhere, written in C. In Rust 2024, the block itself must be marked `unsafe`, because the compiler cannot verify the declaration.
2. We call it inside an `unsafe { ... }` block, because Rust cannot verify what that function does at runtime either.
3. Everything else is completely normal Rust.

Run it:

```sh
cargo run
# Absolute value of -42 is 42
```

That's it. You just wrote your first FFI.

## Example 2: C calls a Rust function

The other direction works too: exposing a Rust function so a C program can call it.

First, the Rust code, in `src/lib.rs`:

```rust
#[unsafe(no_mangle)]
pub extern "C" fn hello_world_from_rust() {
    println!("Hello, world!");
}
```

Then, in `Cargo.toml`, we specify that we want to produce a shared library that can be used from the outside:

```toml
[lib]
crate-type = ["cdylib"]
```

Run `cargo build`. On macOS, Cargo produces a dynamic library at:

```
target/debug/libffi_blog_post.dylib
```

The file name comes from the package name (`ffi-blog-post`): hyphens become underscores, and macOS uses the `.dylib` extension (on Linux it would be `.so`, on Windows `.dll`).

On the C side, a small `call_rust.c` file:

```c
extern void hello_world_from_rust(void);

int main(void) {
    hello_world_from_rust();
    return 0;
}
```

The function name must match exactly what Rust exports. With `#[unsafe(no_mangle)]`, Rust keeps `hello_world_from_rust` as-is — if C declares a different name, the linker will fail with "Undefined symbols."

Then compile and run it on macOS:

```sh
gcc call_rust.c -L target/debug -lffi_blog_post -o call_rust
DYLD_LIBRARY_PATH=target/debug ./call_rust
# Hello, world!
```

A few macOS-specific details worth noting:

- **`-lffi_blog_post`** links against `libffi_blog_post.dylib`. The `lib` prefix and file extension are added automatically by the linker.
- **`DYLD_LIBRARY_PATH`** tells macOS where to find the `.dylib` at runtime. On Linux, the equivalent variable is `LD_LIBRARY_PATH`.

Result: the C program prints "Hello, world!", even though it is Rust code that produced that message.

## Common beginner pitfalls

FFI is not just "sprinkle `unsafe` everywhere and hope for the best." Here are the mistakes that come up most often.

**Mismatched function names.** With `#[unsafe(no_mangle)]`, the C declaration must use the exact same name as the Rust function. A typo on either side gives a linker error, not a compiler error.

**Forgetting that strings are not the same.** In C, a string always ends with a `\0` byte. A Rust `String` does not work like that at all. To convert between the two, use `CString` (Rust to C) and `CStr` (C to Rust), never a manual conversion.

**Sending a pointer to something that no longer exists.** If you hand a pointer to C code, and the Rust object behind that pointer gets dropped in the meantime, you end up with a dangling pointer. The program might crash, or worse, silently corrupt memory without crashing right away.

**Ignoring struct layout.** By default, Rust is free to reorder a struct's fields however it wants, to optimize memory. C always keeps the order you declared. If a struct is shared between Rust and C, you need `#[repr(C)]`, otherwise the two languages will disagree on how the data is organized.

**Letting a `panic!` cross the FFI boundary.** If a Rust function called from C panics, the behavior on the C side is undefined. Either avoid panicking in that kind of function entirely, or catch the panic with `catch_unwind`.

**Getting the types wrong.** An `int` in C is not always an `i32` in Rust, depending on the platform. That is exactly why the `libc` crate exists: it provides the correct type aliases (`c_int`, `c_char`, `size_t`, and so on), already accurate for each platform.

## Going further

Once the basics are in place, two tools will save you a lot of time:

- **`bindgen`**: automatically generates Rust declarations from a C header file (`.h`). Very useful for large C libraries, so you don't have to write declarations by hand.
- **`cbindgen`**: does the opposite, generating a C header file from your Rust code, so you can expose a Rust library to C code.

You will also often run into a naming convention in the Rust ecosystem: a `foo-sys` crate that holds the raw, dangerous (`unsafe`) bindings to a C library, and a `foo` crate that wraps it in a safe, pleasant-to-use interface. That is exactly the logic of separating the part that touches danger from the part other developers will actually use day to day.

## What I take away from this

FFI is not a topic reserved for experts. It is a tool, like any other, for making Rust coexist with the massive C ecosystem that already exists. The key is understanding that every `unsafe` is a promise you make to the compiler, and that promise needs to be taken seriously: correct types, correct memory handling, correct checks at the boundary.

The day you need to link a cryptographic C library, or get a Tor SDK running on your machine, this topic stops being theoretical and becomes a tool you reach for regularly.

**Code. Think. Build.**
