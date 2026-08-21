---
author: Jonathan Nenba
pubDatetime: 2026-08-21T06:12:00Z
title: 'Rust Targets Explained Simply'
slug: rust-targets-explained-simply
featured: false
draft: false
tags:
    - rust
    - rustup
    - cargo
    - cross-compilation
    - software-engineer
description: Your Rust code does not have to run on the machine that compiles it. Here is what targets and toolchains really are, how to read a target triple, and how to build for Linux, Windows, or ARM from your own laptop.
---

At some point, every Rust developer runs into a command like this one:

```bash
cargo +nightly build --target wasm32-unknown-unknown
```

Maybe you copied it from a README. Maybe CI runs it and you never asked why. It works, so you move on. But there are two different ideas packed into that one line, and mixing them up causes real problems later: builds that pass on your machine and fail in CI, or an afternoon lost wondering why "installing nightly" did not give you WebAssembly support.

The two ideas are the **toolchain** (`+nightly`) and the **target** (`--target wasm32-unknown-unknown`). The toolchain answers: *which compiler builds my code?* The target answers: *where will the result run?* This post explains both, with a focus on targets, because that is where the real power is: the same Rust code can become a Linux server binary, a Windows `.exe`, a Raspberry Pi program, or a WebAssembly module. You just change the target.

## rustup: the tool that manages everything

`rustup` is not the Rust compiler. It is the installer and version manager that sits above it, like `nvm` for Node or `pyenv` for Python. When you install Rust the official way, you actually install `rustup`, and `rustup` installs everything else.

```bash
rustup --version
# rustup 1.28.2 (2025-04-28)

rustup toolchain list
# stable-aarch64-apple-darwin (default)
# nightly-aarch64-apple-darwin

rustup update
```

`rustup` manages three kinds of things: **toolchains** (versions of the compiler), **targets** (platforms you can compile for), and **components** (extra tools like Clippy). These three words are the vocabulary of this whole post.

A detail that surprises people: when you type `cargo` or `rustc`, you are usually running a small `rustup` shim. It decides which toolchain should handle the command and passes it on. That is what makes the `+nightly` syntax work.

## What is a toolchain?

A toolchain is a complete installation of Rust: the compiler (`rustc`), the build tool (`cargo`), and the standard library, all from one release. Toolchains come from three channels:

- **stable** — released every six weeks, tested, your default.
- **beta** — the next stable, published early to catch problems.
- **nightly** — built every night from the main branch. The only channel where unstable features can be turned on.

You can also install an exact version:

```bash
rustup toolchain install nightly
rustup toolchain install 1.85.0
```

To use a toolchain for one command, put `+<toolchain>` right after `cargo`:

```bash
cargo +nightly build
```

The `+nightly` never reaches cargo. The rustup shim reads it, picks the nightly toolchain, and runs *that* toolchain's cargo and compiler.

Here is the point to remember, because it is the most common confusion in this whole area: **nightly is a toolchain, not a target.** Building with nightly does not change where your binary runs. A nightly build on your Mac is still a Mac binary, just made by a newer compiler. If you want your code to run somewhere else, you do not need a different toolchain. You need a different *target*.

## What is a target?

A target describes the platform your compiled code will run on: the CPU architecture, the operating system, the binary format. By default, `cargo build` targets the machine you are sitting at. But that is only a default.

You can see every target the compiler knows with:

```bash
rustc --print target-list
```

The list is long — over 250 entries, from the PlayStation Vita to ESP32 microcontrollers. In practice, you will keep meeting the same five:

**`x86_64-unknown-linux-gnu`** — 64-bit Linux on Intel/AMD. This is where most Rust code runs in production: cloud servers, CI runners, Docker containers.

**`aarch64-apple-darwin`** — Apple Silicon Macs. If you work on an M-series MacBook, this is what plain `cargo build` produces.

**`x86_64-pc-windows-msvc`** — 64-bit Windows. The target for shipping `.exe` files to Windows users.

**`aarch64-unknown-linux-gnu`** — 64-bit ARM Linux. Quietly became huge: Raspberry Pi, AWS Graviton, most ARM cloud servers.

**`wasm32-unknown-unknown`** — WebAssembly. Not a physical machine at all, but a portable format that runs in browsers and on edge platforms. 

### How to read a target name

Those names follow a pattern called the **target triple**: `architecture-vendor-os`, sometimes with a fourth part, the ABI suffix. For example, `aarch64-apple-darwin` means: **aarch64** (64-bit ARM), **apple** (the vendor), **darwin** (the kernel under macOS).

Two terms worth defining in passing:

**ARM** is a CPU architecture family with a different instruction set from Intel/AMD's x86. Built for power efficiency, it powers phones, Apple Silicon Macs, Raspberry Pi, and AWS Graviton servers. `aarch64` is its 64-bit instruction set (also called ARM64). A binary compiled for x86_64 is gibberish to an ARM chip, and vice versa.

**ABI suffix** is the part after the OS: the `gnu` in `x86_64-unknown-linux-gnu`, the `msvc` in `x86_64-pc-windows-msvc`. The ABI (*Application Binary Interface*) is the low-level contract a binary follows — how functions pass arguments, which system libraries it links against. Same CPU, same OS, different ABI = incompatible binaries. That is why Linux has both `-gnu` (glibc) and `-musl` (static binaries).

## Toolchain vs target, side by side

| | Toolchain | Target |
| --- | --- | --- |
| Answers | Which compiler builds the code? | Where does the result run? |
| Examples | `stable`, `nightly`, `1.85.0` | `x86_64-unknown-linux-gnu`, `wasm32-unknown-unknown` |
| Selected with | `cargo +nightly ...` | `cargo build --target ...` |
| Installed with | `rustup toolchain install nightly` | `rustup target add wasm32-unknown-unknown` |

So our opening command, read correctly:

```bash
cargo +nightly build --target wasm32-unknown-unknown
```

Two independent choices. `+nightly`: use the nightly compiler. `--target`: produce WebAssembly instead of a native binary. You can change either one without touching the other.

A simple analogy: the toolchain is which version of the translator you hire. The target is which language you ask them to translate into. A newer translator does not change the output language.

## Installing a target

Your toolchain comes with exactly one target installed: the one matching your machine. Every other target is opt-in, because each one ships its own copy of the Rust standard library, precompiled for that platform:

```bash
rustup target add wasm32-unknown-unknown
```

Piece by piece: `rustup` is the manager, `target add` means "download support for one more compilation target", and `wasm32-unknown-unknown` names which one. What lands on disk is the standard library compiled for WebAssembly. Without it, your code has nothing to link against — the standard library built for your Mac is useless inside a wasm module.

Targets are installed *per toolchain*. If you added one to stable but build with `+nightly`, nightly needs its own copy. Forgetting this is a rite of passage; at least the error message tells you what to run.

After installing:

```bash
cargo build --target wasm32-unknown-unknown
```

Instead of a native executable, you get a `.wasm` file, and it lands in `target/wasm32-unknown-unknown/debug/` instead of `target/debug/`. Cargo keeps each target's artifacts in its own folder, so builds never overwrite each other.

One honest caveat: installing a target gives you the *standard library* for that platform, not a promise that *your project* compiles for it. Your dependencies must support the target too. A crate that spawns threads or opens sockets will fail on wasm no matter what you install, because those things do not exist there.

## Host vs target: cross-compilation

Two words worth pinning down:

- The **host** is the machine where the compiler runs.
- The **target** is the machine where the program runs.

Most of the time they are the same, and you never think about it. The moment they differ, you are **cross-compiling**. Picture an Apple Silicon Mac building a server binary for Linux:

```bash
cargo build --target x86_64-unknown-linux-gnu
```

The host is `aarch64-apple-darwin` — where `rustc` runs, where the fans spin. The target is `x86_64-unknown-linux-gnu` — the binary contains x86 instructions and Linux system calls, and cannot run on the Mac that made it. The Mac is the factory. The Linux server is where the product ships. (`rustup show` prints your host, on the "Default host" line.)

Rust is genuinely good at this, because `rustup` hands you a precompiled standard library for dozens of platforms in one command. But compiling is only part of the job. The last step is **linking** — joining your code with system libraries — and the linker is a platform-specific tool that `rustup` does not provide. So the command above may fail on a Mac with a linker error even though the Rust side compiled fine. In practice, people use [cargo-zigbuild](https://github.com/rust-cross/cargo-zigbuild) or [cross](https://github.com/cross-rs/cross) (which builds inside Docker), or simply build in CI on a runner that matches the target.

## Components: the third thing rustup manages

Alongside toolchains and targets, `rustup` manages **components**: optional tools that plug into a toolchain. The two everyone uses:

```bash
rustup component add clippy
rustup component add rustfmt
```

The commands look like `target add`, so keep the difference sharp: `rustup target add` gives you the ability to *compile for another platform*. `rustup component add` gives you *tooling* — a linter, a formatter. A target is a place; a component is a tool.

## One file to pin it all: rust-toolchain.toml

Everything above configured *your machine*. That is fragile in a team: you are on 1.89, a teammate is on 1.86, CI froze something else months ago. Same code, three compilers, different results.

The fix is a `rust-toolchain.toml` file at the root of the repository:

```toml
[toolchain]
channel = "stable"
targets = ["wasm32-unknown-unknown"]
components = ["rustfmt", "clippy"]
```

When anyone runs a `cargo` command inside the project, the rustup shim reads this file first and uses the toolchain it names — installing it, with the listed targets and components, if missing. Nobody follows a setup guide. The first `cargo build` after cloning installs the right environment by itself, and your machine, your teammate's machine, and CI all compile with the same compiler.

Do not confuse it with `Cargo.toml`: that one describes your *package* (name, dependencies). `rust-toolchain.toml` describes the *environment that builds it* (compiler version, targets, components).

## Common mistakes

**"I need wasm, let me install nightly."** No. Nightly is a toolchain; wasm is a target. `rustup target add wasm32-unknown-unknown` works fine on stable.

**"I added the target, so my project compiles for it now."** The target gives you a standard library, nothing more. A dependency that needs threads or sockets can still refuse to build.

**Mixing up rustup, cargo, and rustc.** Three layers: `rustup` manages installations, `cargo` manages your project, `rustc` compiles code. You almost never call `rustc` directly.

**"Target, component, same thing."** A target is a platform to compile *for*. A component is a tool added *to* the toolchain.

**"Cross-compilation just works."** The Rust half does. The linker half may not, depending on the target.

## The mental model to keep

If you keep four lines from this post, make them these:

> **Toolchain** = which compiler builds your code.
> **Target** = where the result is meant to run.
> **Component** = extra tooling attached to a toolchain.
> **Host** = the machine where the compilation happens.

And a practical takeaway: next time you join a Rust project, run `rustup show` first, and if the project has no `rust-toolchain.toml`, add one. The whole class of "works on my machine, fails in CI" problems disappears.
