---
title: "Qiskit 2.0 transpiler auto-selects error mitigation strategy"
date: 2026-03-25
tags: [quantum]
nodes: [qiskit, ibm-quantum]
---

The new StagedPassManager detects gate fidelity from backend calibration data and inserts ZNE or PEC circuits automatically. No more guessing which mitigation fits your topology.
