---
author: Jonathan Nenba
pubDatetime: 2026-02-07T14:30:00Z
title: 'Optimizing docker images for Rust production ready deployment'
slug: optimizing-docker-images-rust-production
featured: false
draft: false
tags:
  - docker
  - devops
  - optimization
  - rust
  - kamal-deploy
  - vps
description: After migrating to self-hosted VPS with Kamal Deploy, my disk filled up fast. Here's how I optimized Rust docker images and automated cleanup.
---

After migrating from AWS to self-hosted VPS with Kamal Deploy, I quickly ran into a problem: my server's disk was filling up fast. Every deployment created new Docker images, and old ones just sat there taking up space. I had to manually delete them, which wasn't sustainable.
This post shares what I learned about optimizing Docker images, implementing security best practices, and automating cleanup with Kamal Deploy hooks.

When you deploy Rust applications frequently with Kamal, Docker keeps all the old images. After just a few deployments:

```bash
# Check Docker disk usage
docker system df
```

**Why are Rust Docker images so large by default?**

1. **Full Rust toolchain** - `rust:latest` includes the entire compiler, cargo, rustup (~1GB)
2. **Debug symbols** - Release builds include debug info by default
3. **Dependency bloat** - All build dependencies stay in final image
4. **No multi-stage builds** - Build artifacts mixed with runtime

Most of that 5.5GB? Old images with unnecessary build tools.

## Three Key Solutions

1. **Build ultra-small images** - From 1GB to 20MB using multi-stage builds
2. **Implement security hardening** - Non-root users, read-only filesystems, vulnerability scanning
3. **Automate cleanup** - Remove old images after deployment with Kamal hooks

Let's tackle all three with Rust-specific optimizations.

## Part 1: Building Optimized Rust Docker Images

### Understanding Rust's Compilation Model

Rust compiles to native binaries, which means:
- No runtime needed (unlike Node.js or Python)
- Can use `scratch` or `alpine` as base
- Single static binary with all dependencies
- Tiny final images (10-30MB)

But we need to optimize the build process first.

## The Basic (Unoptimized) Dockerfile

Here's a typical Rust Dockerfile that's **not production-ready**:

```dockerfile
# NOT OPTIMIZED
FROM rust:1.75

WORKDIR /app
COPY . .
RUN cargo build --release

EXPOSE 8080
CMD ["./target/release/myapp"]
```

**Problems with this approach:**

**Massive image size** - 1GB+ (includes entire Rust toolchain)
**Security risks** - Runs as root user
**Slow builds** - Recompiles all dependencies on every code change
**Debug symbols** - Unnecessary bloat in production
**No layer caching** - Cargo rebuilds everything
**Development tools** - Compiler, rustup, docs all included

## The Optimized Production Dockerfile

Here's the **production-ready version** with all optimizations:

```dockerfile
# OPTIMIZED RUST DOCKERFILE

#############################################
# Stage 1: Build Environment
#############################################
FROM rust:1.75-alpine AS builder

WORKDIR /app

# Install build dependencies for Alpine
RUN apk add --no-cache \
    musl-dev \
    pkgconfig \
    openssl-dev

# Create empty project for dependency caching
COPY Cargo.toml Cargo.lock ./

# Create dummy main.rs to cache dependencies
RUN mkdir src && \
    echo "fn main() {println!(\"Dummy\");}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy actual source code
COPY src ./src

# Touch main.rs to force rebuild of our code only
RUN touch src/main.rs

# Build with optimizations
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build --release && \
    cp /app/target/release/myapp /app/myapp

# Strip binary to remove debug symbols
RUN strip /app/myapp

#############################################
# Stage 2: Production Runtime
#############################################
FROM alpine:3.19

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata

# Create non-root user with UID >= 10000
RUN addgroup -g 10001 -S rustapp && \
    adduser -u 10000 -S rustapp -G rustapp

# Copy binary from builder
COPY --from=builder --chown=rustapp:rustapp /app/myapp /app/myapp

# Switch to non-root user
USER rustapp

EXPOSE 8080

CMD ["/app/myapp"]
```

**What makes this optimized:**

1. **Alpine builder** - Smaller base image (174MB vs 1GB)
2. **Multi-stage build** - Final image doesn't include Rust toolchain
3. **Dependency caching** - Build deps separately with dummy `main.rs`
4. **BuildKit cache mounts** - Persist cargo registry across builds
5. **Static linking** - `musl-dev` for standalone binaries
6. **Stripped binary** - Remove debug symbols with `strip`
7. **Minimal runtime** - Alpine + CA certs only
8. **Security** - Non-root user with UID >= 10000
9. **Health checks** - Automatic failure detection

## Understanding the Dependency Caching Trick

The dummy `main.rs` trick is crucial for fast Rust builds:

```dockerfile
# 1. Copy only Cargo files
COPY Cargo.toml Cargo.lock ./

# 2. Create dummy project
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# 3. Copy real source
COPY src ./src

# 4. Touch to force rebuild
RUN touch src/main.rs
```

**Why this works:**

1. **First build** - Compiles all dependencies (cached)
2. **Code changes** - Only recompiles your code
3. **Layer caching** - Docker reuses dependency layer
4. **Touch trick** - Forces cargo to rebuild only changed files

## BuildKit Cache Mounts for Rust

BuildKit cache mounts persist Cargo's registry across builds:

```dockerfile
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build --release
```

**What gets cached:**

- `/usr/local/cargo/registry` - Downloaded crates
- `/app/target` - Compiled dependencies

**Enable BuildKit:**

```bash
# Globally
export DOCKER_BUILDKIT=1

# Or per-build
DOCKER_BUILDKIT=1 docker build -t myapp .
```

## Optimizing Cargo.toml for Smaller Binaries

### 1. Enable Link-Time Optimization (LTO)

```toml
[profile.release]
# Enable full LTO (slower compile, smaller binary)
lto = true

# Or use thin LTO (faster compile, still smaller)
lto = "thin"

# Optimize for size over speed
opt-level = "z"  # or "s"

# Remove panic strings
panic = "abort"

# Strip debug symbols
strip = true

# Reduce code bloat
codegen-units = 1
```

## Example: Complete Rust Web Service

Here's a complete example with **Axum** (lightweight web framework):

**Cargo.toml:**

```toml
[package]
name = "rust-api"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = { version = "0.7", default-features = false, features = ["tokio"] }
tokio = { version = "1.35", default-features = false, features = ["rt-multi-thread", "net", "macros"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tower-http = { version = "0.5", features = ["cors"] }

[profile.release]
lto = true
opt-level = "z"
codegen-units = 1
panic = "abort"
strip = true
```

**src/main.rs:**

```rust
use axum::{
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[derive(Serialize, Deserialize)]
struct HealthResponse {
    status: String,
    version: String,
}

#[derive(Serialize, Deserialize)]
struct ApiResponse {
    message: String,
    data: Option<String>,
}

// Health check endpoint
async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

// Main API endpoint
async fn api_handler() -> Json<ApiResponse> {
    Json(ApiResponse {
        message: "Welcome to Rust API".to_string(),
        data: Some("Production-ready!".to_string()),
    })
}

#[tokio::main]
async fn main() {
    // Build our application with routes
    let app = Router::new()
        .route("/", get(api_handler))
        .route("/health", get(health))
        .layer(CorsLayer::permissive());

    // Run on 0.0.0.0:8080
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    
    println!("Server running on http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind");
    
    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
```

**Dockerfile:**

```dockerfile
FROM rust:1.75-alpine AS builder

WORKDIR /app

RUN apk add --no-cache musl-dev

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

COPY src ./src
RUN touch src/main.rs

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build --release && \
    cp /app/target/release/rust-api /app/rust-api && \
    strip /app/rust-api

FROM alpine:3.19

RUN apk add --no-cache ca-certificates

RUN addgroup -g 10001 -S rustapp && \
    adduser -u 10000 -S rustapp -G rustapp

COPY --from=builder --chown=rustapp:rustapp /app/rust-api /app/rust-api

USER rustapp

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["/app/rust-api"]
```

**Build and run:**

```bash
# Build
DOCKER_BUILDKIT=1 docker build -t rust-api:latest .

# Check size
docker images rust-api:latest
# REPOSITORY   TAG       SIZE
# rust-api     latest    18.5 MB

# Run
docker run -p 8080:8080 rust-api:latest

# Test
curl http://localhost:8080/health
# {"status":"healthy","version":"0.1.0"}
```

**Solution: Automated cleanup with Kamal hooks**

Kamal has a "hooks" system that runs scripts at different stages of deployment. We'll use the `post-deploy` hook to clean up automatically after each deployment. This script will remove old images and keep your disk usage under control without any manual work.

### Basic Cleanup Script

Create `.kamal/hooks/post-deploy`:

```bash
#!/bin/bash

# Remove dangling images (untagged)
docker image prune -f

# Remove images older than 48 hours
docker images --format "{{.ID}} {{.CreatedAt}}" | \
  awk '$2 " " $3 " " $4 < "'$(date -d '48 hours ago' '+%Y-%m-%d %H:%M:%S')'" {print $1}' | \
  xargs -r docker rmi -f 2>/dev/null || true

# Clean build cache (keep last 72 hours)
docker builder prune -f --filter "until=72h"

# Show disk usage
echo "Current disk usage:"
docker system df

echo "Cleanup complete!"
```

Make it executable:

The script needs execute permissions so Kamal can run it. Use this command to make it executable:
```bash
chmod +x .kamal/hooks/post-deploy
```

## Additional Optimizations

### 1. Use .dockerignore

When Docker builds an image, it copies your entire project directory by default. This includes things you don't need (like compiled code, git history, documentation). The `.dockerignore` file tells Docker what to skip, making builds faster and images smaller.

Create `.dockerignore` to exclude unnecessary files:

```
# Rust specific
target/
**/*.rs.bk
*.pdb

# Docker
Dockerfile
docker-compose.yml
.dockerignore
```

### 2. Parallel Compilation

By default, Cargo uses only one CPU core for the final linking stage. If you have a multi-core CPU, you can speed up compilation by telling Cargo to use more cores. This won't affect the final binary, just how fast it builds.

Speed up Rust compilation:

```dockerfile
# Set number of parallel jobs
ENV CARGO_BUILD_JOBS=4

# Or in Cargo.toml
[build]
jobs = 4
```

## Testing Your Rust Docker Setup

### Build and Verify

Before deploying to production, verify that your image is actually optimized and secure. These commands check the size, scan for vulnerabilities, and inspect the build.

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Build image
docker build -t rust-api:test .

# Check image size (should be < 30 MB)
docker images rust-api:test
# REPOSITORY   TAG    SIZE
# rust-api     test   22.3 MB

# Scan for vulnerabilities
trivy image --severity HIGH,CRITICAL rust-api:test
# Total: 0 (HIGH: 0, CRITICAL: 0)

# Lint Dockerfile
hadolint Dockerfile

# Inspect layers
docker history rust-api:test
```

### Load Testing with wrk

Finally, test how your Rust API performs under load. Rust should handle tens of thousands of requests per second with minimal memory usage. This load test helps verify your optimizations didn't hurt performance.

```bash
# Install wrk
brew install wrk

# Start container
docker run -d -p 8080:8080 --name rust-api rust-api:test

# Load test
wrk -t4 -c100 -d30s http://localhost:8080/
# Requests/sec: 45,000+

# Memory during load
docker stats rust-api --no-stream
# MEM USAGE: 58 MB
```

## Conclusion

Optimizing Rust Docker images is essential for production deployments. By implementing these practices, you can achieve:

Rust's compilation model makes it perfect for Docker optimization. With static binaries and minimal runtime requirements, you can achieve image sizes that would be impossible with interpreted languages.

Start with the optimized Dockerfile template, add security hardening and let Kamal handle the cleanup. Your production deployment will be faster, smaller, safer, and more reliable.

## Additional Resources

### Official Documentation

- [Rust Docker Official Image](https://hub.docker.com/_/rust)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [BuildKit Documentation](https://docs.docker.com/build/buildkit/)
- [Cargo Optimization Guide](https://doc.rust-lang.org/cargo/reference/profiles.html)

### Security Resources

- [Trivy Vulnerability Scanner](https://github.com/aquasecurity/trivy)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

### Rust-Specific Tools

- [cargo-chef](https://github.com/LukeMathWalker/cargo-chef) - Better layer caching
- [cargo-bloat](https://github.com/RazrFalcon/cargo-bloat) - Find large dependencies
- [cargo-audit](https://github.com/rustsec/rustsec) - Security vulnerability scanner
- [cargo-deny](https://github.com/EmbarkStudios/cargo-deny) - Dependency linting

### Deployment Tools

- [Kamal Deploy](https://kamal-deploy.org/)