# Transmissions from the Lattice

A digital twin interface built with [Astro](https://astro.build). Interactive knowledge graph, terminal shell, identity files, and content feed — all driven by markdown and YAML.

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:4321
npm run build      # → static site in ./dist
```

## Project Structure

```
lattice/
├── content/
│   ├── til/              ← TIL entries as markdown (frontmatter + body)
│   ├── articles/         ← Longer posts as markdown
│   └── projects.yaml     ← Project registry (status, stack, description)
├── graph/
│   ├── nodes.yaml        ← Knowledge graph nodes (id, label, category, date)
│   └── edges.yaml        ← Connections between nodes
├── identity/
│   ├── soul.md           ← Core beliefs and worldview
│   ├── personality.md    ← Communication style and opinions
│   └── expertise.md      ← Technical domains and skill levels
├── src/
│   ├── layouts/Layout.astro
│   └── pages/index.astro ← Main app (reads all data at build time)
└── public/
    └── styles/global.css ← Design system
```

## Adding Content

### New TIL

Create `content/til/YYYY-MM-DD-slug.md`:

```markdown
---
title: "Your TIL title"
date: YYYY-MM-DD
tags: [ai, data, quantum, sec]
nodes: [mcp, vault]          # which graph nodes this relates to
---

Your TIL body text here.
```

### New Graph Node

Add to `graph/nodes.yaml`:

```yaml
- id: new-node
  label: Display Name
  cat: ai          # ai | data | quantum | security | philosophy
  added: "2026-04"
  r: 6             # visual size (4-10)
  desc: >
    Description shown in the detail panel.
```

Then connect it in `graph/edges.yaml`:

```yaml
- [new-node, agents]
- [new-node, mcp]
```

### New Project

Add to `content/projects.yaml`:

```yaml
- name: Project Name
  status: active    # active | wip | concept | archived
  desc: One-line description.
  stack: [Tool1, Tool2]
  nodes: [mcp, agents]
```

## Deploy to GitHub Pages

1. Push to GitHub
2. Go to repo → Settings → Pages → Source: GitHub Actions
3. The included `.github/workflows/deploy.yml` handles the rest
4. Site is live at `https://yourusername.github.io/lattice`

### Custom Domain (optional)

1. Buy a domain (Namecheap, Cloudflare, etc.)
2. Point DNS to GitHub Pages (CNAME or A records)
3. Add `CNAME` file to `public/` with your domain
4. Update `site` in `astro.config.mjs`

## Terminal Commands

The terminal supports shell-style commands:

| Command | Action |
|---------|--------|
| `help` | Show available commands |
| `ls projects` | List all projects |
| `ls nodes` | List knowledge graph nodes |
| `cat soul.md` | View identity file |
| `search <query>` | Search & highlight nodes |
| `filter <category>` | Filter graph by domain |
| `clear` | Clear terminal |

Anything else is treated as a question to the digital twin (mocked in offline mode).

## Upgrading to Live Chatbot

Replace the mocked responses with a Cloudflare Worker or API route that proxies to:
- **Claude API** (Anthropic) — uses identity/*.md as system prompt
- **Local LLM on DGX Spark** — via Cloudflare Tunnel

The terminal already handles the chat UX; you just swap the response source.

## License

MIT
