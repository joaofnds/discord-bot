# AGENTS.md

Repository-specific instructions for AI coding agents. Read this before running
tools or proposing changes.

## Toolchain

Use Bun and the scripts in `package.json` for development and checks. The lint
and format scripts run the installed Oxlint and Oxfmt through Bun so their Node
shebangs do not introduce a second runtime. Keep the production dependency
overrides when migrating tooling. Remove them only with a deliberate dependency
update so runtime changes remain reviewable.

Mise pins Bun and injects `.env`. Bun's automatic dotenv loading is disabled to
keep that environment source consistent. If Bun is missing from the shell PATH,
run commands through `mise exec -- bun`.

The default format scripts check tooling configuration so the migration preserves
the existing source layout. Pass a source path explicitly to format it.

Keep tests Jest-like with `describe`, `it`, and `expect` from `bun:test`. Use nested
`describe` blocks for contexts and preserve the handwritten fakes below.

## Conventional Commits are load-bearing

`.github/workflows/commit.yaml` runs `joaofnds/semantic-release-action` on every
push to `main`, with the `conventional-changelog-conventionalcommits` plugin. It
reads commit subjects to decide the version bump, so a subject with no type
prefix silently suppresses the release.

Write a lowercase type, an optional scope, then a lowercase imperative subject:
`fix(crons): stop the status bot double-posting on a retry`. The body says why.
This overrides any generic style rule that asks for a bare subject.

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
