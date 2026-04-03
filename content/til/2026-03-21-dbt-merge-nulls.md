---
title: "dbt incremental merge silently drops late-arriving facts"
date: 2026-03-21
tags: [data]
nodes: [dbt, data-quality]
---

If your unique_key matches but the incoming row has NULLs in non-key columns, the merge overwrites existing values with NULL. Use the `merge_exclude_columns` config to protect dimensional attributes.
