---
name: scholarly-ui-ux-design
description: >-
  Design system and UI/UX patterns for academic scholarly journals, high-density editorial tables,
  author transparency audit reports, publication countdowns, and accessible component hierarchies.
  Use when designing or refactoring UI components, pages, forms, or data visualizations.
---

# Scholarly UI/UX Design Skill

This skill defines the visual language, layout standards, and interaction patterns for the IJSDS platform using Tailwind CSS, Radix UI, and Lucide icons.

---

## 1. Editorial Aesthetic & Design System

- **Typography**: Scholarly serif headings (`font-serif`, Newsreader / Merriweather aesthetic) combined with crisp, modern sans-serif body typography (`font-sans`, Inter / system fonts) and monospace metadata (`font-mono`).
- **Color Palette**:
  - **Primary**: Deep academic terracotta/crimson (`#9E3B1B` / `#7C2D12`) communicating authority and scholarly distinction.
  - **Backgrounds**: Warm parchment tones (`#fdf9f5`, `#f8f6f0`) for reading comfort, avoiding stark clinical white `#ffffff`.
  - **Status Semantics**:
    - Cleared / Accepted / Published: Emerald (`text-emerald-700`, `bg-emerald-50`, `border-emerald-200`)
    - Revision Required / Pending: Amber/Gold (`text-amber-700`, `bg-amber-50`, `border-amber-200`)
    - Rejected / Critical: Muted Crimson/Rose (`text-rose-700`, `bg-rose-50`, `border-rose-200`)
    - In Audit / Processing: Indigo/Sky (`text-sky-700`, `bg-sky-50`, `border-sky-200`)

---

## 2. High-Density Editorial Components

### A. Stage 2 Transparency Report Modals
- Group metrics logically: Plagiarism / AI-Authorship / Citation Resolution / Recommendations.
- Provide clear visual hierarchy: Badges at top right, executive summary banner, followed by expandable/scrollable detailed evidence cards.
- Clearly differentiate actionable revision requirements from informative suggestions.

### B. Two-Tier Payment Gates
- Transparent breakdown of fees:
  - Gate 1 (₦5,000 Evaluation Fee) clearly labeled as non-refundable editorial screening.
  - Gate 2 (₦25,500 APC) displayed with an unlocked badge only after audit clearance.
- Secure Paystack CTA with fallback notices and clear receipt generation.

### C. 28-Day Monthly Cycle Countdown Widget
- Visual calendar/clock indicator showing current batch target and days remaining until the 28th.
- Reassuring microcopy explaining the 23:59 WAT 27th cutoff and automated non-punitive rollover.

---

## 3. Accessibility & Usability (WCAG 2.1 AA)

- All interactive buttons and inputs must have distinct focus rings (`focus-visible:ring-2 focus-visible:ring-primary`).
- Contrast ratio between text and background must meet or exceed 4.5:1 for normal text and 3:1 for large headings.
- Dialogs and modals must trap focus properly, support Escape to dismiss, and declare `aria-labelledby` and `aria-describedby`.
