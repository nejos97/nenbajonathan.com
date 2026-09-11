---
author: Jonathan Nenba
pubDatetime: 2026-09-11T12:46:40Z
modDatetime: 2026-09-11T12:46:40Z
title: "Spec-Driven Development: The Code Is No Longer the Bottleneck"
slug: spec-driven-development-the-code-is-no-longer-the-bottleneck
featured: false
draft: false
tags:
  - ai
  - spec-driven-development
  - software-engineering
  - ai-agents
  - productivity
description: AI coding agents are making code cheap to produce. The hard part is moving upstream, toward intent, specifications and decisions. Here is why Spec-Driven Development matters, how it works in a team, and what Shopify's React Native story teaches us.
---

For a long time, software development was mainly about writing code.

If you wanted to ship a new feature, a large part of the effort went into designing it, writing the code, testing it, fixing bugs, and finally deploying it. In a traditional Software Development Life Cycle (SDLC), the process looked roughly like this:

<img src="/assets/images/blog/traditional_sdlc_flow_transparent.svg" alt="Traditional SDLC flow from Requirements to Maintain, with the Build phase much wider than the others" width="640" style="border: none" />

The **Build** phase could easily take the largest share of a project. Developers had to turn ideas and requirements into thousands of lines of code, by hand, one line at a time.

With AI coding agents, generating code is becoming much cheaper and much faster. And when one step in a process gets dramatically cheaper, the bottleneck does not disappear. It moves.

The real challenge today is understanding what should be built, defining it clearly, making the right technical decisions, and making sure the final implementation actually matches the intent.

This is where **Spec-Driven Development (SDD)** becomes interesting.

## What is Spec-Driven Development?

Spec-Driven Development is a way of building software where the **specification becomes the main source of truth**.

Instead of starting with:

> Build this feature.

and immediately asking an AI agent to write code, you first describe what the software should do. You answer questions such as:

- What problem are we solving?
- Who is the user?
- What should happen?
- What should *not* happen?
- What are the constraints?
- What does success look like?

Only then does the AI agent use this specification to create a plan, break the work into tasks, and implement the solution.

The idea is simple:

<img src="/assets/images/blog/sdd_flow_transparent.svg" alt="Spec-Driven Development flow: Specify, Plan, Tasks, Implement, Validate, with the result checked back against the specification" width="600" style="border: none" />

GitHub's Spec Kit follows exactly this approach. It describes SDD as an intent-driven process where the specification defines the **what** before the **how**, with several refinement steps instead of one large prompt.

## SDD is not just "better prompting"

This distinction matters.

Spec-Driven Development is not about writing a very long prompt and asking an AI to generate an entire application in one shot. It is about building a **development process around AI agents**.

The specification becomes an artifact that the team can read, review, discuss, change and validate. The AI agent is then responsible for moving from that specification toward an implementation.

So instead of:

<img src="/assets/images/blog/prompt_vs_sdd_flow_transparent.svg" alt="Comparison of the prompt-based flow (Human, Prompt, AI, Code) with the Spec-Driven Development flow (Human, Intent, Specification, Plan, Tasks, AI Agent, Code, Validation)" width="680" style="border: none" />

The human remains responsible for the intent and for the important decisions. The agent takes on more of the implementation work.

## How does it work in a team?

This is where SDD becomes really interesting.

Imagine a platform where merchants create their own online stores. The product team wants to add a new payment method, Mobile Money, so that merchants can offer it to their shoppers at checkout. In a traditional workflow, a product manager writes some requirements, a designer produces the checkout UI, and developers start implementing. Context lives in meetings, Slack threads and people's heads.

With SDD, the team first agrees on a detailed specification. For example:

> Merchants can enable Mobile Money as a payment method for their store.
>
> A merchant must connect a verified Mobile Money account before the method can be enabled.
>
> At checkout, shoppers only see Mobile Money if the merchant has enabled it and the shopper's currency is supported.
>
> A payment is confirmed only when the provider's webhook is received. Duplicate webhooks must not credit an order twice.
>
> If a payment is not confirmed within 10 minutes, the order is marked as failed and the shopper can retry.
>
> Merchants can disable the method at any time. Pending payments already started must still be completed.
>
> The merchant dashboard must show the status of each Mobile Money payment and the settlement amount.

Now the team shares a common understanding of the feature, including the edge cases that usually appear late in a project. The developer can then ask an AI agent to:

1. Review the specification.
2. Identify missing or ambiguous requirements.
3. Create an implementation plan.
4. Break the plan into tasks.
5. Implement the tasks.
6. Run the tests.
7. Check the implementation against the specification.

The important part is that **the specification is not thrown away once coding starts**. It stays part of the development process, from the first discussion to the final validation.

This also changes how people collaborate. A product manager, a designer, a developer and an AI agent can all work from the same source of truth. The developer spends less time re-explaining the same context to the agent. And when requirements change, the specification changes first, before the code.

## GitHub Spec Kit

One of the projects that makes this approach very concrete is **GitHub Spec Kit**.

Spec Kit is an open-source toolkit designed to help teams practise Spec-Driven Development with AI coding agents. Its workflow is built around a sequence of steps:

<img src="/assets/images/blog/spec_kit_workflow_transparent.svg" alt="GitHub Spec Kit workflow: Constitution, Specify, Clarify, Plan, Tasks, Implement, Converge, grouped into principles, what to build, how to build it, and build and check" width="640" style="border: none" />

What I find interesting is the separation of concerns:

1. First, you define the project's principles (the *constitution*).
2. Then you describe **what** you want to build.
3. Then you clarify the parts that are still ambiguous.
4. Then you define **how** you are going to build it.
5. Then you break the work into smaller tasks.
6. Finally, the agent implements the tasks and checks whether the result matches the specification.

In practice, this looks like a handful of slash commands inside your coding agent:

```text
/speckit.specify
/speckit.plan
/speckit.tasks
/speckit.implement
/speckit.converge
```

The exact commands depend on the agent you use, but the idea stays the same.

Spec Kit is also not the only option. Several tools and frameworks are exploring this space, including **GitHub Spec Kit, Kiro, OpenSpec and other AI-native development workflows**. The tools will probably change. The underlying idea is what matters:

**Give the agent a clear specification, not just a prompt.**

## This also changes how we think about technology choices

There is another angle to this shift, and **Shopify** offers a good example.

A few years ago, Shopify moved heavily toward React Native. The goal was to stop building the same features twice, once for iOS and once for Android.

After five years, Shopify reported that the move had been a success: feature parity became much easier, engineers could move between web and mobile, and the company had more capacity to ship value. By the end of 2023, all of their apps had been migrated to React Native.

But Shopify is not saying:

> "React Native is the answer to everything."

Quite the opposite. Their current position is closer to:

**Use React Native where it makes sense. Use native where native is better.**

Shopify explains that native can still be the better choice for hardware-heavy features, on-device AI, widgets, Apple Watch features, Siri Shortcuts and some long-running background jobs.

So they are not really "going back to native". They are becoming comfortable using **both**.

I think this is an important lesson. When building software becomes faster and cheaper, we can afford to spend more time asking:

> **What is the best technology for this problem?**

instead of:

> **What technology lets us write the least amount of code?**

Cross-platform frameworks became popular in part because writing code was expensive, and writing it twice was very expensive. When an agent can generate a large part of the implementation, that constraint weakens, and the question becomes a real engineering choice again.

## The real shift

AI is not simply making developers write code faster. It is changing where the value is created.

When code generation was expensive, writing code was a major part of the job. When agents can generate, modify, test and refactor large amounts of code, the difficult part moves upstream:

- Understanding the problem.
- Defining the requirements.
- Making architecture decisions.
- Writing good specifications.
- Managing constraints.
- Reviewing the result.
- Knowing when the implementation is actually correct.

None of these are new skills. Good engineers have always done them. What changes is their weight. They used to be a fraction of the job. They are becoming the job.

That is why I see **Spec-Driven Development less as a new way of prompting AI, and more as an engineering discipline for the age of AI agents.**

The code is getting cheaper.

**The thinking is becoming more valuable.**
