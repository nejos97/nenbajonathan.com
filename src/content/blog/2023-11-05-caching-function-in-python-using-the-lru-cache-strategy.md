---
author: Jonathan Nenba
pubDatetime: 2023-11-05T03:00:00Z
modDatetime: 2023-11-05T03:00:00Z
title: 'Caching function in Python Using the LRU Cache Strategy'
slug: caching-function-in-python-using-the-lru-cache-strategy
featured: false
draft: false
tags:
  - python
  - caching
  - lru
  - function
description: Improve considerably the performance of your python applications with the lru_cache decorator
---

### Introduction

In the realm of software development, efficiency is king. Reducing the time complexity of your code is often a primary objective, especially when dealing with functions that perform heavy computations. Python offers a built-in way to optimize such functions by memoizing their outputs. This technique is known as caching, and it's particularly useful when the same expensive function calls are made repeatedly with identical arguments. The `functools` module provides a decorator, `lru_cache`, which implements this strategy with an efficient approach known as "Least Recently Used" (LRU) caching.

### What is Caching?

Caching is akin to taking notes in a lecture. Instead of recalculating the answer every time a function is called, Python can refer to a "note" of previously computed results. This simple concept can dramatically reduce execution time, as retrieving a value from a cache is typically orders of magnitude faster than computing it from scratch.

### Understanding `lru_cache` and Its `maxsize` Parameter

The `lru_cache` decorator automates the process of storing function results in a cache. Its `maxsize` parameter determines how many of these results to store, with the LRU strategy ensuring that only the most recently accessed results are kept. This strategy elegantly balances the trade-off between time complexity and space complexity.

The `maxsize` parameter is pivotal for the following reasons:

- **Memory Management:** A smaller `maxsize` means less memory usage, but also more frequent recalculations if the cache is too small for your needs.
- **Performance Tuning:** A larger cache can prevent recalculations but adds overhead in memory and potential cache management.
- **Unbounded Caching:** Setting `maxsize` to `None` can lead to unbounded cache growth, which, if unchecked, can consume all available memory and lead to performance degradation.

Selecting an optimal `maxsize` is not always straightforward. A power of two is usually recommended for the `maxsize` value because it aligns with how computers manage memory and can lead to slight performance optimizations.

### Example: Caching Prime Number Calculations

Let's apply `lru_cache` to prime number calculation:

```python
from functools import lru_cache

@lru_cache(maxsize=32)  # Small cache size for demonstration
def is_prime(num):
    if num < 2:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True

@lru_cache(maxsize=32)  # Cache the most recent calls to speed up the calculation
def nth_prime(n):
    prime_count = 0
    num = 1
    while prime_count < n:
        num += 1
        if is_prime(num):
            prime_count += 1
    return num

# Let's see the caching in action
print(nth_prime(1000))  # Calculates and caches intermediate results
print(nth_prime(1001))  # Reuses the cache and only calculates the next prime
print(nth_prime(500))   # This result is cached, so it's retrieved instantly
```

In this code, the `is_prime` and `nth_prime` functions are decorated with `lru_cache` with a `maxsize` of 32. The cache stores the most recent 32 results. If you call `nth_prime` with a value less than or equal to 32 plus the last cached result, it will quickly return the result from the cache without recalculating.

### Conclusion

Utilizing `lru_cache` with an appropriate maxsize is a smart way to enhance the performance of your Python functions that perform repetitive and intensive calculations. It allows you to save on computational costs and execute programs faster. However, it's essential to balance between the desired speed-up and the available memory resources. Experimenting with different maxsize values can help you find the sweet spot for your specific use case.
