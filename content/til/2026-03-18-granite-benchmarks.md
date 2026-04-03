---
title: "Granite 34B GPTQ-4bit on DGX Spark: 42 tok/s with 128k context"
date: 2026-03-18
tags: [ai, infra]
nodes: [llm-infra, local-first]
---

AWQ was 2% faster on throughput but GPTQ held better accuracy on structured output tasks. Full model fits in unified memory — no offloading needed.
