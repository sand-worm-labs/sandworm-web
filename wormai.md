# Worm AI — Development Guide (Draft)

This is the **development draft** for building Worm AI — the natural language assistant layer for Sandworm.

This document outlines:

- our **AI development roadmap**,
- dev plans,
- use cases + test cases we aim to support,
- fallback strategies,
- and how we intend to evolve Worm AI into a fully-capable, prompt-first interface for non-technical users.

---

## Overview

We are building Worm AI to make **onchain data querying accessible through prompts**. Instead of writing WQL manually, users can simply _ask_, and the AI will handle the rest — from generating the query to executing it or offering insights.

Currently, we're using **Vercel AI** for rapid prototyping, but we see **Eliza** as a better long-term fit due to its flexibility and grounding features.

---

## Core Goal

Enable **non-technical users** to:

1. Interact with Sandworm through natural language
2. Perform actions like:

   - Generating + executing WQL queries
   - Saving + fixing queries
   - Explaining query results
   - Visualizing data
   - Identifying tokens, addresses, entities
   - Getting live stats (token price, tx volume, etc.)

Worm AI will be considered _production-ready_ when it can perform **key IDE functions** via prompt alone.

---

## 🧪 Phase 1: Query Generation (Baseline)

Start with core RPC queries using our **real-time RPC tables**. Initial test cases include:

- ✅ “What’s the balance of `vitalik.eth`?”
- ✅ “Show me recent transactions from this address”
- ❌ “What’s my balance?” → No address provided → AI should ask follow-up
- ❌ “What’s Ceeriil’s balance?” → Unknown token/address/chain → AI should clarify

These are **predictable intents**. We expect high accuracy in this phase.

> ⚠️ **Note:** To achieve high accuracy, we need to feed Worm AI with **well-written WQL examples** that use **our actual table structure** and **stylistic conventions**.
> WQL is very close to **PostgreSQL**, but it has its own nuances — so blindly generating vanilla SQL will often fail. Instead, we should **handcraft examples** for key patterns (e.g. balance queries, transfer history, etc.) and fine-tune/guideline on those.

---

## 🛠️ Phase 2: Dealing With Ambiguity

Next, Worm AI should be able to handle **vague or incomplete prompts**, e.g.:

- “Last transactions of Pepe” → Who is Pepe? Which chain? What contract?
- “Show ETH whales activity” → Define "whale"? Over what time period?

In such cases, Worm AI should:

- Ask clarifying questions
- Suggest common alternatives
- Or fallback to UX-friendly flows (e.g., “Open in IDE”, “Report to team”, etc.)

---

## 📊 Phase 3: Visual + Analytical Queries

Introduce more analytical actions:

- Token price over time
- Volume comparisons
- Wallet behavior over days
- DEX interactions
- Breakdown by token category

These are still **structured**, but require multi-step querying + visualization.

---

## ⚠️ RPC vs Indexed Mode

We treat **real-time RPC** and **indexed queries** differently.

**RPC Mode**:

- Queries are direct and predictable
- Can be executed quickly with minimal validation

**Indexed Mode**:

- Broader + deeper datasets
- We must first **validate** if the table or data exists before querying
- Avoids unnecessary node load / failed queries

Fallback here = graceful error + insight collection (e.g., “We don’t support that yet. Want to request it?”)

---

## 🌐 Long-Term Goals & Intelligence Features

Worm AI is not just about query generation — it should evolve into a full **onchain intelligence assistant**, capable of:

### 🔍 Context-aware understanding

- Recognize **popular tokens, pools, contracts** like `USDC/ETH`, `ETH/BTC`, etc.
- Infer default chains for known tokens without needing user input
- Pull metadata from WQL tables directly (e.g., latest listings, token metadata)

### 🌐 Web-integrated knowledge

- Connect to the internet (e.g. news, social platforms, block explorers)
- Enable Worm AI to respond to real-time events like:

  - “What happened with the Circle exploit?”
  - “Summarize today’s major token unlocks”
  - “What’s trending on Base?”

### 📈 Novel/Niche Analysis

- Provide unique angles based on indexed data
- Predictive analytics or anomaly detection
- Custom wallet behavior profiling
- "This wallet is acting like a launch sniper"

### 📰 AI-Powered Briefings

- After query execution, Worm AI should be able to:

  - Generate a **brief** or **summary** of insights
  - Add interpretation layers (e.g., “This address bridged \$2M in the last hour, likely prepping for an airdrop”)
  - Suggest follow-up queries based on results

This turns Worm AI into more than just a query tool — it's a **data copilot**.

---

## Worm AI Milestone Checklist

Start with the **most common use cases**, then level up gradually.

| #   | Use Case                                            | Status                     |
| --- | --------------------------------------------------- | -------------------------- |
| 1   | Get token balance by ENS                            | 🔄 In progress             |
| 2   | Get recent txs of address                           | ✅ Working                 |
| 3   | Detect missing context (“my balance”)               | 🧠 Needs follow-up logic   |
| 4   | Identify unknown token names (“Ceeriil”)            | ❌ Needs entity resolution |
| 5   | Token price over X days                             | 🔜 Next                    |
| 6   | Wallet’s token portfolio                            | 🔜 Next                    |
| 7   | Visualize tx volume by day                          | 🔜 Next                    |
| 8   | Compare two tokens                                  | 🔜 Next                    |
| 9   | Fetch NFT transfers by user                         | ❌ Not yet                 |
| 10  | Handle vague queries (“whales”, “activity”, “pepe”) | ❌ Not yet                 |
| 11  | Generate post-query briefings                       | 🧪 Experimental            |
| 12  | Detect trending events (via web)                    | 🔮 Long-term               |
| 13  | Ingest failed queries for learning                  | 🔄 In progress             |

---

## 🚧 Notes

- Accuracy for **structured, known prompts** should be very high from the start.
- We'll use **failed queries + logs** to continuously improve intent detection.
- Worm AI doesn’t have to be perfect — but it should _always be helpful_, and never feel dumb or repetitive.
