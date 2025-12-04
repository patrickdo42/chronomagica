# AGENTS.md

This is an instructions file for AI coding agents to provide context about the
project and setup any rules and coding style.

## Project context

This project is called chronomagica. It's a webapp that displays astrological
and planetary information for users. More information about the project and its
requirements can be found in the root README.md. Use this file as the source of
truth for the project and please update anytime major requirements or
requirements change.

## Tech Stack

- Typescript
- React
- Tanstack Start
- vite
- vitest
- pnpm
- prettier
- oxlint
- shadcn

## Coding rules

- Prefer an extremely terse coding style. As a rule of thumb, every line of code
  is a liability. Always prefer simplicity over complexity. Avoid
  over-engineering and future-proofing at all costs unless absolutetly necessary
  and when there is a real concrete benefit and it outweighs any negatives.
- ALWAYS USE PNPM. NEVER USE NPM or YARN.
- Frequently use the following commands to verify the correctness of any new
  code you write and to get feedback so you can iterate when necessary:
  - `pnpm run typecheck`
  - `pnpm run test`
  - `pnpm run format:fix`
  - `pnpm run lint`
