---
title: "NVIDIA DGX Spark on My Desk: A Builder’s Review of the Local Inference Machine I’d Been Waiting For"
date: 2026-04-01
type: article
tags: [agents, ai, sovereign ai, local inference]
nodes: [agents, ai, sovereign ai, local inference]
---

What changes when 128GB of local inference memory stops being the bottleneck.

A colleague pinged me the day the NVIDIA GTC event was happening: “You’re going to want to watch this one live.”

So I did. Jensen Huang on stage, holding what looked like a gold Mac Mini, talking about putting AI supercomputing on the desk of every developer. I was watching on my MacBook Pro with 32GB of shared memory, and immediately thinking about the things I’d been wanting to run locally in an air-gapped environment.

For a while, I’d been thinking about a MacBook with 128GB of memory. But even that sat in an awkward category for me: expensive, still shared with the rest of the system, still negotiating with the browser, Docker, the IDE, and everything else every time you load a serious model.

Then the Spark price appeared on screen: about $4,000 at launch, now closer to $4,700 depending on channel and configuration. For 128GB of unified memory dedicated to inference, that changed the calculation.

This is not a benchmark review. It’s a builder’s review. I’m not trying to answer whether this is the most cost-efficient silicon per dollar on the market. I’m trying to answer a different question: what changes when local inference stops being the bottleneck?

What follows is not a spec-sheet summary. It is an account of finally having a machine that could run the kinds of local systems I’d been designing in my head for months.

Press enter or click to view image in full size

The Machine That Was Missing
My daily machine has 32GB of shared memory. That is enough to experiment with smaller models, understand local inference, and get a feel for the latency and quality tradeoffs. It is not enough to run anything serious without constant compromise.

That compromise shows up everywhere. Which quantization level can I get away with? Does this model even fit? How much memory can I leave for the rest of the machine before everything slows down? Can I run Whisper Large, or am I forced down to a smaller speech model just to keep the pipeline responsive?

What I actually wanted, without fully naming it that way at the time, was not a bigger laptop. I wanted a separate inference machine. Something that sits next to the main workstation and handles the model workloads cleanly. Your laptop stays your laptop. The inference box does inference.

That is the category the Spark falls into for me: not a replacement for a daily driver, and not a miniature data center, but a dedicated local inference node that happens to fit on a desk. A dedicated local inference node that happens to fit on a desk.

The same GB10 Grace Blackwell Superchip is also available through OEM systems - Lenovo offers it in the ThinkStation PGX. Different chassis and support paths, same underlying idea. For people thinking about procurement, support contracts, or enterprise purchasing, that matters. But the core interest here is simpler: 128GB available to the inference workload, without fighting the rest of the machine for it.

What 128GB Actually Changes
I want to make this comparison concrete, starting from where many of us actually are: not in a data center, but at a desk.

Press enter or click to view image in full size

The consumer GPU path is already useful. A 3090 or 4090 gets you to 24GB, which means good 13B-class local work and some larger quantized models if you are careful. A 48GB professional card extends that ceiling. But if what you actually want is to run a 120B-class model locally and still have room for the rest of the stack, you hit a wall quickly.

That is the point of 128GB here. Not that it is “bigger” in some abstract sense, but that it changes the size of model you can run and leaves enough memory for everything around it.

And that second part matters just as much.

Everything Running at Once
The real difference is not just that a larger model fits. It is that you stop having to choose between the model and the system around it.

The local stack I care about looks roughly like this: a voice interface over sensitive data, fully local and air-gapped. That means an LLM, speech-to-text, text-to-speech, retrieval, document storage, conversation history, and a backend that ties it all together. I do not want to run one part at a time. I want the whole stack available simultaneously.

A rough memory picture looks like this:

’’’bash
128 GB total
├── GPT-OSS 120B (MXFP4)       ~65 GB  ████████████████████████████████░
├── Whisper Large v3             ~3 GB  ██░
├── Coqui XTTS v2                ~2 GB  █░
├── OpenSearch / vector index    ~6 GB  ███░
├── PostgreSQL                   ~2 GB  █░
├── Backend API                  ~2 GB  █░
├── OS + system overhead        ~10 GB  █████░
└── Free headroom               ~38 GB  ░░░░░░░░░░░░░░░░░░░
’’’

The 120B model takes a little over half the total pool. The rest of the system still fits comfortably: speech in, speech out, retrieval, metadata, database, API layer. And there is still headroom left over.

That is the shift. One box can host the whole private AI stack.

And in practice, the stack loaded cleanly. DGX OS already gives you the pieces you want in place: CUDA, Docker with GPU passthrough, and a setup that feels much closer to a usable inference environment than a machine that still needs hours of negotiation before real work begins. I loaded GPT-OSS 120B expecting the usual dance — which quantization level will it fall back to, will it even fit — and it just loaded. No warnings. No errors.

I ran inference through Ollama, which is the most straightforward path for a lot of local workflows, but also tested vLLM. Both worked. Generation speed on GPT-OSS 120B (MXFP4) lands around ~40 tok/s with Ollama and a bit more with vLLM on a single unit. That number will be more honest to you than saying it felt “fast enough” — it is fast enough for single-user daily use, and noticeably slower than a data center GPU if you are thinking about serving multiple concurrent users.

Subscribe to the Medium newsletter
The other practical detail worth mentioning is speech. On smaller local setups, Whisper is often where compromise starts. Here, running Whisper Large v3 in real time becomes realistic, which matters because it lets you choose the better speech model instead of the smaller one that only wins by fitting more easily. That sounds minor until you start using voice as an actual interface. Then it stops being minor very quickly.

The Use Case That Made This Interesting for Me
The use case that made DGX Spark interesting was a private voice RAG pipeline: the ability to talk to my own sensitive documents and get spoken answers back, without sending any of that data to the cloud. And compared to the alternative — building out a GPU server, renting cloud GPU time, or hoping a hosted API eventually offers privacy guarantees — this is a remarkably cheap way to get there. A single unit is a one-time cost that buys you dedicated 120B-class inference, permanently, with no ongoing API spend.

That requires a few pieces working together.

A vector database / knowledge base is where the processed document chunks live after ingestion. You chunk the source material, embed it, and store those embeddings so relevant passages can be retrieved at query time. I chose OpenSearch mainly because hybrid retrieval matters to me: full-text BM25 and vector search in one service is useful when some queries are semantic and others depend on exact wording. For a personal stack where the data is heterogeneous and queries are often specific, that combination is more practical than a pure vector store.

Speech-to-text and text-to-speech models handle the voice layer. Whisper Large v3 for input — open, accurate, CUDA-accelerated, genuinely real-time on this hardware. Coqui XTTS v2 for output — near-real-time synthesis with reasonable voice quality.

An LLM to reason over retrieved content and generate responses. This is where most of the memory goes, and this is also the layer where local execution matters the most, because this is where the sensitive content is actually processed. For straightforward retrieval and summarisation, smaller models can already do useful work. For more complex multi-step flows, structured outputs, or agentic workflows where reliability matters — tool calls that need to be right, JSON that cannot malform — a 120B-class model makes a noticeable difference.

A server layer around it all: PostgreSQL for structured metadata and conversation history, Redis for caching and session coordination, a FastAPI layer to wire the components together, and MCP-style tool bridges where external access needs to be controlled. This is the part that often gets overlooked: the Spark is not just a GPU worker. It is a small server with headroom to run real services alongside the model. One box handles the whole stack.

Put together, the flow looks like this:

voice in → Whisper transcribes → retrieval finds the relevant material
         → the model reasons over it → XTTS speaks the answer
The key property is not elegance. It is a locality. The documents stay on the machine. The query stays on the machine. The conversation history stays on the machine. That changes what kinds of data this architecture becomes viable for.

Projects I’ve Been Carrying Around in My Head
This is really what the article is about.

The hardware is only interesting because of what it makes practical.

For a long time, the limiting factor for the systems I wanted to build was not the architecture. It was that the models worth using were either proprietary and cloud-hosted, or open-weight but too large for the hardware I had. This kind of machine changes that.

An air-gapped agentic environment. An orchestration layer running against a local 120B model, with no external API calls in the chain. The appeal is not just privacy. It is the ability to design agents around local tools, local data, and local state. With smaller models, agentic loops often fail in very specific ways: hallucinated tool names, malformed structured output, subtle mistakes in arguments that break the workflow. Larger models do not make those problems disappear, but they reduce them enough to change what feels practical. (One note for anyone thinking about this in a cluster context: the Spark runs DGX OS, which is Ubuntu-based — if your environment uses OpenShift and Red Hat CoreOS as the node OS, it works better as a standalone inference node behind an API endpoint than as a direct GPU worker node.)

A coding agent in a box. A local coding assistant served entirely from local infrastructure. General reasoning on one model, code-heavy tasks on another — something like Devstral from Mistral — both on the same hardware, both staying inside the environment. It can look at sensitive code, reason about sensitive code, and suggest changes to sensitive code — all without anyone having to explain later why the source tree went on an unexpected trip.

A personal ERP, fully local. This is the Upways direction I’ve been building in parts: food tracking, fitness, personal knowledge, daily challenges, all connected by a reasoning layer over personal data. Not because “personal ERP” is a clever phrase, but because natural-language access to your own structured and unstructured data becomes much more useful once the privacy answer is simple: the data stays on your hardware.

Working with data I cannot send out. Health data, financial history, private notes, internal work materials, sensitive correspondence. For this class of data, cloud inference is often a non-starter. Local inference is not a convenience feature here. It is the architecture requirement.

Eventually, local adaptation and experimentation. Not large-scale training. Not pretending a desk machine is a cluster. But real experimentation on personal or domain-specific data without renting GPUs or exporting the data elsewhere.

These are not abstract possibilities. They are the reason I wanted to test the machine in the first place.

What This Is For — and What It Isn’t
I think it is worth being precise about the audience.

This is probably not the right machine if your local work fits comfortably within 7B to 14B models, or if you are happy building around a 24GB GPU and making the usual compromises. There are cheaper paths into local AI, and many of them are already good.

It is also probably not the right lens if what you want is a classic benchmark comparison against a custom workstation build. A DIY system may still be a better answer depending on budget, tolerance for setup work, and what exactly you want to optimise for.

Where this becomes interesting is narrower and, for me, more important: when you want a dedicated local inference machine capable of running a serious model and the surrounding stack together, especially in privacy-sensitive or air-gapped environments.

That is the category where this stopped being an interesting product announcement and became a useful machine.

Final Thought
What stayed with me after testing the Spark was not the industrial design, the launch event, or the novelty of having 128GB sitting on a desk.

It was the absence of compromise.

For the first time, I could think about a local AI system as a complete system: model, voice, retrieval, state, backend, all running in one place, without immediately redesigning the architecture around memory limits.

That does not make this a universal recommendation. It does make it the first desk-sized machine I have tested that felt like it belonged to the class of problems I actually want to work on.

And that, for me, is the interesting part.