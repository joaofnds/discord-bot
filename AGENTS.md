# AGENTS.md

Repository-specific instructions for AI coding agents. Read this before running
tools or proposing changes.

## Toolchain — this is a Deno project, not Node

There is no `package.json`, no `node_modules`, no biome. Project config lives in
`deno.json`.

- **Format:** `deno fmt <path>`
- **Type-check:** `deno check <path>`
- **Tests:** `deno task test`
- **Run:** `deno task start` / `deno task start:watch`

`deno` is managed by mise and is not on the bare PATH in non-interactive shells.
If `deno` returns "command not found", prefix every command with `mise exec --`
(e.g. `mise exec -- deno task test`, `mise exec -- deno fmt <path>`).

Do not reach for `biome`, `prettier`, `eslint`, `tsc`, `jest`, `vitest`, or
`npm`/`npx` — none are wired up and invoking them wastes a round-trip. Do not
add a `package.json` to "fix" a missing tool. Imports use the `imports` map in
`deno.json` (`npm:` and `jsr:` specifiers); add new dependencies there.

If a generic TypeScript style guide you carry says "run biome after edits," that
rule does not apply here — substitute the Deno equivalents above.

## Tests use hand-written Fakes, not mocking frameworks

This codebase has no `vi.fn()`, no `jest.mock`, no spies. Side-effect
collaborators are tested via explicit Fake classes that implement the same
interface as production code. Existing fakes live in `test/` (`FakeClock`,
`WebhookBotMock`, `*-mock.ts`) and inline in test files (`FakeRandom`,
`FakeClaudeStatusAPI` in `src/crons/claude-status-bot.test.ts`).

When you need to control randomness, time, or an external call, look for the
existing fake first; write a new one in the test file if none fits. Do not
introduce a mocking library.

```ts
// FakeRandom.picks: number[] — set indices to control pick()/index() output.
// Assertions reference arr[index], not the string literal. Append to joke
// arrays is safe; reordering or deleting risks breaking tests that hardcode
// specific indices.
random.picks = [2];
// ... trigger code under test ...
expect(webhook.messages).toEqual([bucket.texts[2]]);
```

## Layer-light architecture notes

- `src/crons/` — scheduled bots (`ClaudeStatusBot`, `PragTipBot`, etc.); each
  takes its collaborators via constructor injection.
- `src/chain/` — message handler chain (`Reply` composes a sequence of
  repliers).
- `src/replier/` — reply patterns (plain, probabilistic, regex-matched).
- `src/lib/` — pure utilities and interfaces (`Random`, `Clock`, `time`).
- `src/discord/` — Discord client wrapper.
- `src/const.ts` — string constants, joke arrays, image URLs. Append to joke
  arrays; do not reorder or delete entries — tests assert by index.
- `test/` — shared test helpers.

Constructor injection is the convention everywhere; do not instantiate
side-effect collaborators inline. The interfaces in `src/lib/` (e.g. `Random`,
`Clock`) exist so production wiring uses the real implementation and tests use a
Fake.
