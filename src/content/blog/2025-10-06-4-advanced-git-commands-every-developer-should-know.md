---
author: Jonathan Nenba
pubDatetime: 2025-10-06T01:46:00Z
title: '4 Advanced Git Commands Every Developer Should Know'
slug: 4-advanced-git-commands-every-developer-should-know
featured: false
draft: false
tags:
  - git
  - version-control
  - development
  - productivity
description: Master these four advanced Git commands to recover lost commits, clean up your history, and take full control of your workflow.
---

Git is much more than just `add`, `commit`, and `push`. It’s a powerful tool that gives developers complete control over their code history.  
As projects grow and collaboration becomes more complex, understanding advanced Git commands can make the difference between frustration and fluency.  

In this post, we’ll go through **four advanced Git commands** that every developer should know. They’ll help you temporarily save work, recover lost commits, clean up messy histories, and move changes between branches with precision.

---

### 1. `git stash` — Temporarily Save Your Unfinished Work

Imagine you’re working on a new feature when a teammate asks you to fix something urgent on another branch.  
You don’t want to commit incomplete code just to switch branches — that would clutter your history.  

`git stash` solves this by allowing you to **save your current modifications temporarily**, leaving your working directory clean.

**Example:**
```bash
git stash           # Save your uncommitted changes
git switch main     # Move to another branch
git stash pop       # Restore your work later
````

You can even name your stash for better organization:

```bash
git stash push -m "wip: navbar refactor"
```

Think of it as pressing a “pause” button for your code — you can return exactly where you left off, anytime.

---

### 2. `git reflog` — Recover Lost Commits

Have you ever deleted a branch or run `git reset --hard` and suddenly lost your work?
It happens to everyone or almost hehe, but with `git reflog`, recovery is possible.

`git reflog` keeps a record of **all actions performed in your local Git repository**, even those not visible in `git log`.

**Example:**

```bash
git reflog
# Identify the lost commit
git checkout <commit_id>
```

This command is like a time machine — it tracks every move you make in Git, so you can always go back, even after catastrophic mistakes.

---

### 3. `git rebase -i` — Clean and Reorganize Your Commit History

A messy commit history can make your project difficult to understand and maintain.
That’s where `git rebase -i` (interactive rebase) comes in. It allows you to **reorganize, rename, squash, or remove commits** before pushing your changes.

**Example:**

```bash
git rebase -i HEAD~4
# Options: "squash" (combine commits), "reword" (rename), "drop" (remove)
```

*Tip:* While `merge` creates a new commit combining branches, `rebase` rewrites the existing history — giving it a cleaner, linear flow.

Use it to prepare a tidy, professional commit history before opening a pull request.

---

### 4. `git cherry-pick` — Apply a Specific Commit to Another Branch

Sometimes you need **just one specific commit** from another branch — maybe a bug fix or a small feature — without merging everything else.

`git cherry-pick` lets you do exactly that by copying the desired commit and applying it to your current branch.

**Example:**

```bash
git checkout main
git cherry-pick <commit_id>
```

It’s like picking the perfect cherry from a tree — you take only what you need, without disturbing the rest of the branch.

---

### Quick Recap

| Command           | Purpose                            |
| ----------------- | ---------------------------------- |
| `git stash`       | Temporarily save uncommitted work  |
| `git reflog`      | Recover lost commits               |
| `git rebase -i`   | Clean up and reorganize history    |
| `git cherry-pick` | Apply one commit to another branch |

---