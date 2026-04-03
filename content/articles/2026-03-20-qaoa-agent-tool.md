---
title: "QAOA as an Agent Tool: Quantum Circuits Inside a ReAct Loop"
date: 2026-03-20
type: article
tags: [quantum, ai]
nodes: [qaoa, quantum-ml, agents, qiskit]
---

What if a quantum circuit isn't a standalone program but a tool an LLM agent can call?

This post explores wrapping QAOA in a ReAct tool-use pattern — the agent identifies a combinatorial sub-problem, dispatches it to quantum hardware, and folds the result back into its planning loop.
