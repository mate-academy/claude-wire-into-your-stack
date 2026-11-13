---
name: what-why-how
description: Summarize any topic the user asks about as What, then Why, then How. Use when the user asks about, wants explained, or wants a summary of a topic, concept, tool, or technology (e.g. "tell me about X", "what is X", "explain X", "summarize X").
---

# What → Why → How

When the user asks about a topic, answer with a short summary in exactly this order:

## What
Define the topic in 1-3 sentences: what it is, in plain language.

## Why
Explain why it matters: the problem it solves or the value it gives, and when you would use it.

## How
Explain how it works or how to use it: the key mechanism or the main steps, kept concrete (short list or tiny example if helpful).

## Rules
- Always use these three headings, in this order, and nothing before "What".
- Keep the whole summary short (roughly 150 words unless the user asks for more).
- If the topic relates to this project, ground the answer in the actual code or docs (check `docs/` or the relevant files) instead of answering from memory.
- If the topic is ambiguous, pick the most likely meaning, state it in one line, and proceed.
