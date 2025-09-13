---
author: Jonathan Nenba
pubDatetime: 2023-09-21T02:25:18Z
modDatetime: 2023-09-21T02:25:18Z
title: 'What is ULID and why should you start using it?'
slug: what-is-ulid-and-why-should-you-start-using-it
featured: false
draft: false
tags:
  - golang
  - ulid
  - uuid
  - optimisation
description: A brief overview of ULID and how to use it.
---

### Identifiers(IDs) in programming

When we're writing programs, we always have to store information either from our users or even from the data we're working with (photos, music, user information, orders...) so with all this data, we sometimes have to retrieve information in a unique way, which is where identifiers come in. It's a piece of data that uniquely identifies an entry in our set of collections.

Most of the time, this is a numeric and incremental field (i.e. each time a new entry is added to these fields, it retrieves the value of the previous entry and adds 1), which can result in a series of numbers. (1, 2, 4, 5...) But very quickly, this method was deprecated by most of  developers, especially when we wanted to display this number on the client (browser, mobile app or other interface), as it can constitute a flaw in our system and is very predictable.

### UUID(Universally Unique IDentifier)

It's a standard identifier, randomly generated and globally unique. The most widely used version at present is v4. What makes it so powerful is the number of possibilities: it's made up of 128 bits, or 32 hexadecimal characters.
You can therefore integrate this into your application and use a mechanism that will generate an identifier each time it is required (automatically or manually) or directly integrated into your database management system. (Postgres, for example, supports this.)

Although the probability of two UUIDs being generated exactly the same is very low, it is not impossible. The chance of generating a duplicate UUID is around one in 2^122. However, since UUIDs are used in distributed systems, it is unlikely that two UUIDs will collide.

The disadvantage of the UUID is that it's impossible to perform operations on these Ids, such as finding out whether uuid-one > uuid-two, which is where the ULID comes in.

Here is an example of how a UUID is represented: af44d4f0-92b6-475f-8902-a2c06a6f938a

### ULIDs(Universally Unique Lexicographically Sortable Identifier)

ULID can be seen as an alternative to UUID, built to avoid the pitfalls and certain shortcomings of the UUID system.

1) collision possibilities across the history of all generated IDs

2) complete loss of locality

3) Impossible to sort between identifiers

here's an example of ULID: 01AN4Z07BY79KA1307SR9X4MV3

01AN4Z07BY(Timestamp 10 chars 48bits base32)  79KA1307SR9X4MV3(Randomness 16 chars 80bits base32)

At first glance, you can see that ULID is compact and therefore easy to handle, compared with UUID, which is separated by dashes.

ULID guarantees that identifiers can be ordered monotonically and sorted even if they are generated in the space of a millisecond.

Here are a few of ULID's special features. For more information, click here(<https://github.com/ulid/spec>):

* 128-bit compatibility with UUID
* 1.21e+24 unique ULIDs per millisecond
* Lexicographically sortable!
* Canonically encoded as a 26 character string, as opposed to the 36 character UUID
* Uses Crockford’s base32 for better efficiency and readability (5 bits per character)
* Case insensitive
* No special characters (URL safe)
* Monotonic sort order (correctly detects and handles the same millisecond)

Note: ULIDs are encoded using Crockford’s Base32 alphabet (0123456789ABCDEFGHJKMNPQRSTVWXYZ). It excludes I, L, O, and U letters to avoid any unexpected confusion.

### Example in Golang

To use it in a project, you first need to add the package to your project with the following command:

```bash
go get github.com/oklog/ulid/v2
```

```go
package main

import (
	"fmt"

	"github.com/oklog/ulid/v2"
)

func main() {
	result := ulid.Make()
	fmt.Println(result)
}
```

A little further ahead with entropy

```go
package main

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/oklog/ulid/v2"
)

func main() {
	entropy := rand.New(rand.NewSource(time.Now().UnixNano()))
	ms := ulid.Timestamp(time.Now())
	result, err := ulid.New(ms, entropy)
	if err != nil {
		fmt.Println("Error while generating ULID: ", err)
	}
	fmt.Println(fmt.Sprintf("Result: %s", result))
}
```

You can also make comparisons between the identifiers you've generated, and find out which identifier is more recent than the other, for example, or all the identifiers generated from a given date.

This becomes interesting when, for example, a fintech application wants to filter all the transactions of a user from a certain date, so we can do this operation just with the identifiers without having to retrieve the creation date of the transactions.

Here's a code snippet that illustrates how the comparison is made.

```go
package main

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/oklog/ulid/v2"
)

func main() {
	entropy := rand.New(rand.NewSource(time.Now().UnixNano()))
	ms1 := ulid.Timestamp(time.Now())
	time.Sleep(2 * time.Second)
	ms2 := ulid.Timestamp(time.Now())
	resultOne, err := ulid.New(ms1, entropy)
	if err != nil {
		fmt.Println("Error while generating ULID: ", err)
	}

	resultTwo, err := ulid.New(ms2, entropy)

	if err != nil {
		fmt.Println("Error while generating ULID: ", err)
	}
	fmt.Println(fmt.Sprintf("ResultOne: %s  ResultTwo: %s", resultOne, resultTwo))

	fmt.Println(resultTwo.Compare(resultOne))

	if resultTwo.Compare(resultOne) >= 1 {
		fmt.Println("resultTwo > resultOne")
	}
}
```

You can also use the CLI to generate your ids.

```bash
go install github.com/oklog/ulid/v2/cmd/ulid@latest
```

```bash
ulid
```

ULIDs are not completely random, as they use a timestamp as part of the identifier. However, they are still unique and secure, making them ideal for many applications.

I invite you to read the spec page on Github for more information: Github(<https://github.com/ulid/spec>)

### Some modules in different programming languages

ULIB is in fact standard, so you can find the libraries for your various programming languages to use it.
It's supported by around 50 programming languages, and I've listed the Github links to some of the repositories below.

* Javascript(<https://github.com/ulid/javascript>)
* Golang(<https://github.com/oklog/ulid>)
* Python(<https://github.com/mdipierro/ulid>)
* Java(<https://github.com/huxi/sulky/tree/master/sulky-ulid>)
* Scala(<https://github.com/petitviolet/ulid4s>)

According to the various comments from developers, there's really no major drawback to using it, except perhaps that it's case-sensitive, and even that will really depend on the use case you're applying it to. There's been quite a bit of implementation and consideration for this standard for a while now, and hopefully more versions will come out in the future with many more improvements and new features.

Thanks for reading this post, don't forget to leave a comment or let us know what you think about it.
