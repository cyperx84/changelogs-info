---
title: "Inside Claude Code: What 512K Leaked Lines Reveal About Production Agent Architecture"
date: "2026-04-02"
excerpt: "Claude Code's full TypeScript source shipped in an npm source map. Here are the architectural decisions that matter if you build agent systems — three-layer memory, anti-distillation, and orchestration-as-prompt."
tags: ["AI", "ARCHITECTURE", "CLAUDE CODE", "OPEN SOURCE"]
readTime: "12 min"
category: "ANALYSIS"
author: "changelogs.info"
---

On March 31, 2026, someone noticed that the Claude Code npm package (v2.1.88) shipped with a 59.8MB source map. Not minified. Not obfuscated. The full TypeScript source — roughly 1,900 files and 512,000 lines of it. The entire production codebase for Anthropic's flagship coding agent, sitting in a `.map` file that anyone could download.

I've read through it. Here's what matters if you build agent systems — or if you just want to know how one of the most sophisticated AI products in production actually works under the hood.


## The Stack

Before diving into architecture, the foundation: Claude Code is built on Bun. Not Node. This makes more sense when you remember Anthropic acquired the Bun team in late 2025 — they didn't just buy a runtime, they bought the ability to deeply integrate their agent with a JavaScript runtime at the Zig layer. That matters for things like native client attestation (more on that later).

The UI layer is React rendered through Ink — the same library that powers terminal React apps for everyone else. The terminal rendering pipeline, though, is anything but standard (see the game-engine section below). Validation uses Zod v4, HTTP is Axios, and observability runs through OpenTelemetry. Conservative, battle-tested choices everywhere except the runtime itself.

The entry point is `main.tsx`, which at 785KB is one of the largest single TypeScript files you'll ever encounter. The query engine alone is roughly 46,000 lines. This is not a small program.


## 1. The Three-Layer Memory Architecture

This is the part I found most immediately adoptable. Claude Code doesn't treat memory as one thing. It splits into three layers with very different access patterns.

Layer one: MEMORY.md. This is a lightweight pointer index that's always loaded into context. Each line is roughly 150 characters max. The key insight — it stores locations, not data. Think of it as a table of contents for the agent's own knowledge. "The deployment config is in memory/deploy-config.md" rather than the actual config content.

Layer two: Topic files. These contain actual project knowledge — architectural decisions, debug histories, conventions. They're fetched on-demand when the agent determines it needs them. Not preloaded. This keeps the context window clean for the task at hand.

Layer three: Transcripts. Previous conversation history is never fully reloaded. Instead, the agent greps them for specific identifiers when it needs to recall what happened before. This is a pragmatic choice — transcripts grow without bound, and loading them wholesale would blow the context budget.

There's also a "Strict Write Discipline" baked in: the MEMORY.md index only gets updated after a successful file write. If the write fails, the pointer doesn't get created, so you never end up with an index pointing to nothing. It's a small detail but it prevents a whole class of stale-pointer bugs.

The most interesting philosophical choice: the agent treats its own memory as "hints." When it reads a memory file that says "the auth middleware uses JWT tokens," it still verifies that against the actual codebase before acting on it. Memory is a shortcut, not truth. If you're building any kind of persistent agent, this is the right instinct.


## 2. The Query Engine and the Agent Loop

The query engine is the beating heart — approximately 46,000 lines of TypeScript that handle everything from prompt construction to tool dispatch to response streaming. The `main.tsx` entry point at 785KB is where most of the orchestration lives.

Two details stood out.

First, feature gating. Feature flags are read through a function called `getFeatureValue_CACHED_MAY_BE_STALE()`. The name tells you everything about the engineering tradeoff. When you're checking whether to enable a feature flag on every single agent loop iteration, the latency cost of a fresh remote lookup adds up fast. So they cache aggressively and accept that the flag value might be up to a few minutes stale. For feature flags — which are about gradual rollout, not security — this is the correct call. The system tracks 14 distinct cache-break vectors to know when a cached value is definitely invalid versus probably fine.

Second, prompt caching is treated as "an accounting problem, not just a computer science problem." The system doesn't just cache prompts — it tracks the token cost of each cache hit and miss, factors that into context window budgeting, and makes decisions about what to include or exclude based on the financial cost, not just the technical feasibility. If you've ever wondered why your agent sometimes seems to "forget" earlier context, part of the answer is that it literally calculated it wasn't worth paying to keep it cached.


## 3. The Anti-Distillation System

This is the part that's going to be controversial.

Claude Code has an explicit anti-distillation system. The `ANTI_DISTILLATION_CC` flag, when active, injects fake tool definitions into API requests. These are tools that don't exist in the actual runtime — they're phantom entries designed to pollute the training signal if someone is using Claude API responses to train a competing model.

On top of that, there's server-side connector-text summarization that uses cryptographic signatures. The server summarizes previous context into a signed token that the client can present as verified history, without the full text ever being sent again. The signature means you can't fabricate the summary to manipulate the model's behavior.

The bypass exists, because of course it does: you can strip the anti-distillation field from requests, use environment variables to disable it, or route through third-party API providers that don't enforce it. This is security through obscurity layered on top of a real technical mechanism. Whether that's sufficient or even ethical is a question I'll leave to the reader.


## 4. The Security Model

The bash tool has 23 numbered security checks in `bashSecurity.ts`. Twenty-three. They're literally numbered in the source. Here's what they block:

Zsh builtins are blocked to prevent shell-specific escape vectors. There's a check for equals expansion bypass — the trick where `$(command)` gets hidden inside variable assignments. Zero-space injection attacks, where Unicode zero-width characters are inserted between legitimate command characters, are detected and rejected. IFS null-byte injection, which exploits shell field splitting with null bytes, is also blocked. Malformed token detection catches anything that doesn't parse cleanly.

This is the work of a team that has been burned by prompt injection attacks and decided to be methodical about it. Each check is discrete, testable, and has presumably been triggered by a real attack at some point.

Then there's native client attestation. Because Anthropic controls the Bun runtime (via the Zig layer), they can compute a hash of the running client at the transport layer and send it alongside API requests. The server can verify that the request is actually coming from a legitimate Claude Code installation, not a script pretending to be one. This is the real reason they bought Bun — it gives them a trusted execution environment that Node.js can't provide.

The permission system uses discrete PermissionGate objects — one per tool. Each gate defines what that specific tool is allowed to do, and the user can approve or deny each one independently. It's the principle of least privilege applied to an agent's capabilities.


## 5. The Multi-Agent Coordinator

When `CLAUDE_CODE_COORDINATOR_MODE` is set to 1, Claude Code switches from being a single agent to being an orchestrator that spawns parallel workers. The coordination follows four phases: Research, Synthesis, Implementation, and Verification. Workers execute in parallel during Research and Implementation; Synthesis and Verification are sequential.

Here's the surprising part: the orchestration algorithm is a prompt, not code. The coordinator doesn't have a hardcoded DAG or a finite state machine written in TypeScript. It has a system prompt that tells it how to decompose work, assign it to workers, and merge results. The "algorithm" is the model following instructions.

This is either brilliant or terrifying depending on your perspective. On one hand, it means the coordination strategy improves every time the base model gets better — no code changes required. On the other hand, it means the coordination is fundamentally non-deterministic in a way that traditional orchestration systems aren't. For a coding assistant, the tradeoff makes sense. For a financial transaction processor, maybe not.


## 6. Plan Mode — ULTRAPLAN

ULTRAPLAN is Claude Code's deep planning mode, and it works differently than I expected.

Instead of planning locally, ULTRAPLAN spins up a remote Claude Code Runtime (CCR) session running Opus 4.6 — their most capable model — with a 30-minute thinking budget. Thirty minutes of chain-of-thought reasoning dedicated to producing a plan. There's a browser UI where you can watch the planning happen in real time and approve or redirect it.

When the plan is complete, a sentinel string `__ULTRAPLAN_TELEMETRY_LOCAL__` is embedded in the output. When the local agent encounters this sentinel, it "teleports" the plan result back into the local context and begins execution. It's essentially a remote procedure call where the procedure is "think really hard about this problem."

The architecture implication: Anthropic is treating model capability as a tiered resource. You don't use the most expensive model for every step. You use a cheaper model for the agent loop and escalate to the expensive one only when the problem demands deep planning. This is cost-aware agent design at the infrastructure level.


## 7. The Terminal Rendering Pipeline

This section is pure craft, and if you build terminal tools, study it.

Claude Code's terminal rendering uses game-engine techniques. The screen is represented as an Int32Array-backed ASCII character pool — each character is an integer in a typed array, not a string object. This enables fast diffing and patching of the terminal output without garbage collection pressure.

There's a patch optimizer that calculates the minimal set of terminal escape sequences needed to update the display. And a self-evicting line-width cache that tracks the rendered width of lines (accounting for Unicode, emoji, and CJK characters) and automatically evicts entries when memory pressure increases.

There are 187 spinner verbs. One hundred and eighty-seven different animated spinner states. I'm not sure what to do with this information except to admire the commitment.

The takeaway: if you're building a terminal app that feels sluggish, the problem is probably string allocation and unnecessary re-renders. Typed arrays and patch-based updates are the answer.


## 8. Unreleased Features and the 44 Feature Flags

There are 44 feature flags in the source, and some of them hint at where Claude Code is going.

KAIROS is the most ambitious: an always-on autonomous daemon mode with something called "autoDream memory consolidation." The daemon would run continuously, processing events from your development environment, and periodically consolidate its memories — presumably during idle time — without any human interaction. It's the "AI pair programmer that never sleeps" concept taken to its logical conclusion.

Background agents would run 24/7 with GitHub webhook integration, responding to issues, reviewing PRs, and running checks without any human in the loop. Combined with KAIROS, this paints a picture of a world where your AI agent is always working, always learning, always ready.

Voice mode and Playwright browser control are also in there — voice for hands-free interaction, Playwright for the agent to interact with web applications the same way a human would.

And then there's "Buddy" — a Tamagotchi-style terminal pet with 18 species and shiny variants. I have no architectural insights about this. I just think it's funny and kind of sweet.


## What This Means for You

If you're building agent systems, there are concrete patterns here worth stealing:

**Memory should be layered, not monolithic.** Separate your pointer index from your content from your history. Give each layer different access patterns and different freshness guarantees. And always treat your own memory as untrusted.

**Feature flags need to be fast, not fresh.** Cache them aggressively, name the cache function honestly (`_CACHED_MAY_BE_STALE`), and track your cache-break vectors explicitly.

**Prompt caching is a cost problem.** Track tokens in, tokens out, cache hit rates, and dollar costs. Make architectural decisions based on the accounting, not just the technical possibility.

**Security for agent tools needs to be exhaustive and enumerated.** Don't trust that sanitization is "good enough." Number your checks. Test each one independently. Assume every input is hostile.

**Orchestration can be a prompt.** If you're building with LLMs, the model itself can be the coordination layer. This trades determinism for flexibility — make that trade consciously.

**Terminal rendering should use game-engine patterns.** Typed arrays, patch-based updates, aggressive caching. Your users will feel the difference.

The full source is out there. If you work on agent systems, it's worth reading — not for secrets, but for the accumulated engineering decisions of a team that has been running a production agent at scale and has the scars to prove it.
