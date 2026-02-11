---
author: Jonathan Nenba
pubDatetime: 2026-02-10T15:00:00Z
title: 'Secure your rust code with Trivy: local scan and gitHub actions ci/cd'
slug: secure-rust-code-trivy-local-scan-github-actions
featured: false
draft: false
tags:
  - rust
  - security
  - trivy
  - devops
  - github-actions
  - devsecops
description: Learn how to use Trivy to scan your tust project for vulnerabilities, from a quick local scan to a fully automated gitHub actions pipeline.
---

> **Requirements:** Rust installed (`rustup`), a GitHub account.

As a developer, security should not be the last thing you think about. You write code, add dependencies, and ship, but each dependency you add can bring its own security issues.

**Trivy** is a free and open source security scanner made by [Aqua Security](https://www.aquasec.com/). It checks your project for known vulnerabilities and helps you fix them before they reach production.

Trivy can scan many things:

- **Container images** (Docker, Podman)
- **Project dependencies** (Cargo, npm, pip, Maven, and more)
- **Config files** (Kubernetes, Terraform, Dockerfile)
- **Exposed secrets** (API keys, tokens, passwords)
- **Live Kubernetes clusters**

In this post, we will focus on what matters most for a developer: **scanning your source code and its dependencies**. We will use a small Rust app called `speedtest-rs` as our example project.

## Installing Trivy

Trivy is a single binary there is nothing complex to set up.

### macOS (with Homebrew)

If you are on macOS and already have [Homebrew](https://brew.sh/), just run:

```bash
brew install trivy
```

### Ubuntu / Debian

Add the Trivy repository and install it with `apt`:

```bash
sudo apt-get install wget gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

### Check that it works

```bash
trivy --version
```

## project: `speedtest-rs`

To show how Trivy works, we need a real Rust project with dependencies. We will build a small app that measures your internet download speed by downloading a test file and checking how long it takes.

### Create the project

```bash
cargo new speedtest-rs
cd speedtest-rs
```

### `Cargo.toml`

```toml
[package]
name = "speedtest-rs"
version = "0.1.0"
edition = "2024"

[dependencies]
reqwest = "0.13.2"
tokio = { version = "1.49.0", features = ["macros", "rt-multi-thread"] }
```

### `src/main.rs`

```rust
use std::time::Instant;
use reqwest::get;

const TEST_URL: &str = "https://proof.ovh.net/files/10Mb.dat";

#[tokio::main]
async fn main() {
    println!("Starting speed test...");
    let start = Instant::now();
    let response = get(TEST_URL).await.expect("Failed to download file");
    let bytes = response.bytes().await.expect("Failed to read response bytes");
    let duration = start.elapsed();

    let size_mb = bytes.len() as f64 / (1024.0 * 1024.0);
    let speed_mbps = (size_mb * 8.0) / duration.as_secs_f64();

    println!("Downloaded : {:.2} MB", size_mb);
    println!("Time       : {:.2} seconds", duration.as_secs_f64());
    println!("Speed      : {:.2} Mbps", speed_mbps);
}
```

### Build the project

```bash
cargo build
```

When you run `cargo build`, Cargo creates a `Cargo.lock` file. This file records the exact version of every dependency your project uses. **This is the file Trivy will read to find vulnerabilities.**

> Make sure to commit `Cargo.lock` to your repository. Without it, Trivy cannot check your full dependency tree.

## Scanning your Rust code locally

When Trivy scans a Rust project, it reads `Cargo.lock` and builds a full list of all dependencies. Then it checks each one against several security databases:

- [OSV](https://osv.dev/) Open Source Vulnerabilities
- [GitHub Advisory Database](https://github.com/advisories)
- [RustSec Advisory Database](https://rustsec.org/) focused on Rust packages

### Basic scan command

Run this from the root of your project:

```bash
trivy fs .
```

Trivy will automatically find your `Cargo.lock` and show a report like this:

```
Cargo.lock (cargo)

Total: 3 (UNKNOWN: 0, LOW: 1, MEDIUM: 2, HIGH: 0, CRITICAL: 0)

┌──────────┬───────────────┬──────────┬───────────────────┬───────────────┬──────────────────────────────────┐
│ Library  │ Vulnerability │ Severity │ Installed Version │ Fixed Version │ Title                            │
├──────────┼───────────────┼──────────┼───────────────────┼───────────────┼──────────────────────────────────┤
│ openssl  │ CVE-2023-XXXX │ MEDIUM   │ 0.10.55           │ 0.10.60       │ OpenSSL: potential memory issue  │
└──────────┴───────────────┴──────────┴───────────────────┴───────────────┴──────────────────────────────────┘
```

### Useful options

**Only show HIGH and CRITICAL issues** — ignore low-risk ones:

```bash
trivy fs --severity HIGH,CRITICAL .
```

**Save the report as JSON** — useful if you want to store or process results:

```bash
trivy fs --format json --output trivy-report.json .
```

**Save the report as SARIF** — the format used by GitHub Security tab:

```bash
trivy fs --format sarif --output trivy-results.sarif .
```

**Scan only for vulnerabilities** (skip config checks):

```bash
trivy fs --scanners vuln .
```

**Also check for exposed secrets** (API keys, tokens, etc.):

```bash
trivy fs --scanners vuln,secret .
```

## Adding Trivy to a GitHub Actions pipeline

Running Trivy locally is great. But the real value comes when it runs automatically on every push or pull request 

### Create the workflow file

Create this file in your project: `.github/workflows/trivy-security-scan.yml`

```yaml
name: Security Scan with Trivy

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  trivy-scan:
    name: Trivy Vulnerability Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
      actions: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          toolchain: stable
          cache: true

      - name: Build project
        run: cargo build --release

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          scan-ref: "."
          format: "sarif"
          output: "trivy-results.sarif"
          severity: "CRITICAL,HIGH,MEDIUM"
          scanners: "vuln,secret"
          ignore-unfixed: true

      - name: Upload Trivy results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v4
        if: always()
        with:
          sarif_file: "trivy-results.sarif"
```

### Why these settings matter

**`security-events: write` permission** — this allows the workflow to write results into the GitHub Security(Code Scanning tab). Without it, the upload step will fail silently.

**`if: always()`** on the upload step — by default, a step is skipped if the previous one failed. Trivy returns an error code when it finds vulnerabilities. Without `if: always()`, the results would never be uploaded when issues are found.

**SARIF format** — SARIF (Static Analysis Results Interchange Format) is the standard format that GitHub Code Scanning understands. It lets GitHub display vulnerabilities directly in the repository interface with file-level annotations.

### Block pull requests on critical issues

You can also make the pipeline fail if a critical vulnerability is found. This will block the pull request from being merged until the issue is fixed:

```yaml
- name: Run Trivy (block on CRITICAL)
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: "fs"
    scan-ref: "."
    format: "table"
    severity: "CRITICAL"
    exit-code: "1"        # Fail the job if a CRITICAL issue is found
    ignore-unfixed: true  # Skip issues that have no fix yet
```

### What you see in GitHub

Once the workflow runs, results appear in two places:

1. **Actions tab**: the full console output of each Trivy scan
2. **Security tab**: a list of all vulnerabilities, where you can filter, assign, and mark them as resolved

## Conclusion

Trivy is one of the easiest security tools to add to your workflow. It takes just a few minutes to install, runs with a single command, and integrates cleanly into GitHub Actions.

Here is a quick summary of what we covered:

- `trivy fs .` is all you need to scan your project locally
- `Cargo.lock` must be committed to your repo so Trivy can see all dependencies
- The **SARIF format** is the right choice for GitHub Code Scanning integration
- The **`security-events: write`** permission is required in your GitHub Actions workflow
- Use **`exit-code: "1"`** to block pull requests when critical issues are found

The `speedtest-rs` project we used here is intentionally small, but the same setup works for any Rust project(big or small).

*Resources:*
- [Trivy official documentation](https://aquasecurity.github.io/trivy/)
- [RustSec Advisory Database](https://rustsec.org/)
- [aquasecurity/trivy-action on GitHub](https://github.com/aquasecurity/trivy-action)

**Code, Peace and Love**
