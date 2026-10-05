---
name: code-writing-optimization
description: >-
  Expert guidelines and automated heuristics to optimize code writing, TypeScript type safety,
  React component performance, error resiliency, and clean code practices.
  Use when writing, refactoring, or reviewing frontend and backend TypeScript/React code.
---

# Code Writing Optimization Skill

This skill enforces high-performance, strictly typed, and maintainable software engineering practices across the entire TypeScript and React codebase.

---

## 1. Core Principles

- **Zero Implicit `any`**: Every entity, payload, and API response must have an explicit, immutable type or interface.
- **Defensive Error Handling**: Wrap external network calls (Paystack, Crossref, Supabase, LLMs) in try/catch blocks with graceful fallbacks and user-comprehensible errors.
- **Pure Functions & Immutability**: Prefer pure business logic decoupled from UI components. Treat state and props as immutable.
- **Fail-Safe Defaults**: Never allow null pointer exceptions. Use optional chaining (`?.`), nullish coalescing (`??`), and early return guards.

---

## 2. TypeScript & React Best Practices

### A. State Management & Hooks
- Avoid state duplication: compute derived state during render rather than synchronizing multiple `useState` variables via `useEffect`.
- Keep effects focused: each `useEffect` must have a single responsibility with explicit, minimal dependency arrays.
- Clean up subscriptions and timers in effect returns.

### B. Supabase / PostgREST Calls
- Always handle both data and error return values:
  ```typescript
  const { data, error } = await supabase.from('table').select('*');
  if (error) {
    logger.error('Failed to fetch:', error);
    throw new Error(error.message);
  }
  ```
- Use strict typing with generated database definitions or domain types in `src/types/`.

### C. Performance & Bundle Optimization
- Code-split heavy routes and modals using React `lazy()` and `Suspense`.
- Avoid recreating expensive objects, regexes, or callbacks on every render using `useMemo` and `useCallback` where profiling justifies it.
- Keep dependencies updated and eliminate unused imports.

---

## 3. Code Review & Verification Checklist
Before submitting code changes:
1. `npm run lint` passes without warnings.
2. No console logs left in production execution paths (use structured logging).
3. All async calls have timeout/error fallback handling.
4. Exported functions have JSDoc comments explaining parameters, return values, and edge cases.
