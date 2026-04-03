---
title: "MCP Streamable HTTP silently drops auth headers on cross-origin redirect"
date: 2026-03-23
tags: [ai, sec]
nodes: [mcp, vault, oauth]
---

The fetch spec strips Authorization on cross-origin 302s. If your MCP proxy redirects to a different host, your Bearer token vanishes. Fix: pin transport to single origin or use body-level session tokens.
