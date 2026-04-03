---
title: "HashiCorp Vault AppRole + env var substitution in WxO YAML"
date: 2026-03-19
tags: [sec, ai]
nodes: [vault, watsonx]
---

WxO connection YAML supports `${VAULT_TOKEN}` style substitution. Pair with AppRole's wrapped SecretID for zero-plaintext credential flow in agentic pipelines.
