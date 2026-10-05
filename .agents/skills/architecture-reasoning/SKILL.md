---
name: architecture-reasoning
description: >-
  Systematic reasoning frameworks for academic micro-publishing architectures, event-driven
  pipelines, finite state machines, vector search with pgvector, and ethical isolation firewalls.
  Use when designing, evaluating, or refactoring system components, data schemas, or lifecycle transitions.
---

# Architecture Reasoning Skill

This skill provides the architectural principles, trade-off matrices, and domain models necessary for architecting robust, scalable, and ethically compliant scholarly publishing platforms.

---

## 1. Domain Modeling: 28-Day Monthly Batch Publication Cycle

```
[Continuous Ingestion 24/7/365] 
  --> [Gate 1: ₦5k Evaluation Fee] 
  --> [Stage 2: 24h Synthetic Delay & Integrity Audit]
  --> [Gate 2: ₦25.5k APC & Revenue Split]
  --> [Stage 3: Vector Reviewer Matching (COPE Firewall)]
  --> [Stage 4: Peer Review & Author Revisions]
  --> [Stage 5: Editorial Decision]
  --> [Stage 6: Typesetting, XML, DOI]
  --> [28th Monthly Release Batch]
```

### Key Architectural Constraints
1. **The 28th Release Engine**:
   - Monthly publication happens strictly on the **28th of every month**.
   - Strict Cutoff: Manuscripts reaching `READY_FOR_RELEASE` by **23:59 WAT on the 27th** are minted and published in that month's issue.
   - **Automatic Rollover**: Manuscripts in-progress (peer review, copyediting, revision) maintain their state and roll forward without interruption or penalty.
2. **Deterministic 24-Hour Synthetic Delay**:
   - Stage 2 integrity audits adhere to a 24-hour delayed queue pattern.
   - Purpose: Smooths external API loads (Crossref, OpenAlex, plagiarism vendors), respects rate limits, prevents spamming, and provides authors with a predictable SLA.

---

## 2. Integrity Audit & Governance Reasoning

### A. Provider-Agnostic Adapters
- Plagiarism and AI detection components must be wrapped behind abstract TypeScript interfaces.
- The workflow state machine must never couple to specific vendor schemas or SDKs.

### B. Ethical Governance of AI Signals
- **Never Auto-Reject on AI Score**: AI detection scores are probabilistic risk indicators with inherent false positives. They are treated strictly as an informational signal.
- High AI signals trigger an author clarification request (`AUDIT_REVISION_REQUESTED`) or an editorial human review, never automated `AUDIT_REJECTED`.

### C. Citation Integrity Principles
- **No Fabricated References**: The citation engine only validates against resolved Crossref/OpenAlex/local indexed works.
- **Author Sovereignty**: Recommendations are suggestions only. The engine must never automatically rewrite, inject, or remove references from an author's manuscript without explicit author action.

---

## 3. Reviewer Vector Matching & COPE COI Firewall

### Mathematical Formulation
Given target manuscript abstract embedding $\vec{m} \in \mathbb{R}^{1536}$ and reviewer expertise embedding $\vec{r}_i \in \mathbb{R}^{1536}$:

$$\text{Similarity}(\vec{m}, \vec{r}_i) = 1 - \text{CosineDistance}(\vec{m}, \vec{r}_i) = \frac{\vec{m} \cdot \vec{r}_i}{\|\vec{m}\|_2 \|\vec{r}_i\|_2}$$

### Hard Ethical Filter (COPE Firewall)
$$r_i \neq m.\text{referred\_by\_reviewer\_id} \quad \wedge \quad r_i.\text{is\_available} = \text{true} \quad \wedge \quad r_i.\text{active\_load} < 3$$

The referring reviewer is strictly quarantined from serving as a reviewer, editor, or decision-maker on the referred manuscript to prevent financial and relational conflicts of interest.
