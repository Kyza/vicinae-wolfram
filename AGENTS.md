# AGENTS.md

Vicinae extension for the Wolfram Alpha **Full Results API**. Written in TypeScript + React
(`@vicinae/api`); the launcher renders a serialized UI tree (no browser). API closely follows
Raycast. Reference implementation for idiomatic patterns: `../vicinae-driftwm`.

## Commands

- `npm run build` — `vici build`: validates the manifest, regenerates `vicinae-env.d.ts`,
  **typechecks (tsc, strict)**, then esbuild-bundles each command to `~/.local/share/vicinae/extensions/vicinae-wolfram/`. Fails on any type error.
- `npm run dev` — `vici develop`: watch + rebuild + hot reload; requires the Vicinae app running.
- `npm run lint` — `vici lint`: validates `package.json` against the manifest schema only.

No automated tests. Verification = `npm run build` (or `dev`) plus manual run.

## Structure & wiring (non-obvious)

- `package.json` **is** the extension manifest. Each `commands[]` entry maps to a source file
  `src/<name>.tsx` (view mode) or `src/<name>.ts`/`.tsx` (no-view). Adding a command requires a
  matching file with a default-exported `Command` component.
- `vicinae-env.d.ts` is **auto-generated** from the manifest by `vici build`/`dev`. Never edit it
  manually; edit `package.json` preferences/arguments instead.
- Build bundles all `node_modules` imports except `react`, `react/jsx-runtime`, `@vicinae/api`,
  `@raycast/api` (those are external/runtime-provided). So any npm package can be imported and
  gets inlined — no extra build config. `*.js` is gitignored (build artifacts).
- `tsconfig` targets Node 22; global `fetch`/`Buffer`/node builtins are available in the extension.

## Wolfram Alpha API (hard-earned)

- Endpoint: `https://api.wolframalpha.com/v2/query` with `appid`, `input`, `output=json`,
  `format=image,plaintext,minput,moutput` (one call feeds list + grid views, plus Wolfram
  Language syntax). See `src/lib/wolfram.ts`.
- Response: `queryresult.pods[].subpods[]`, where `subpod.plaintext` is the text result and
  `subpod.img.src` is the image. **Image URLs come back as `http://` — upgrade to `https://`**
  before rendering (`upgradeToHttps`).
- Errors: non-2xx responses return JSON `{status, message}` (e.g. `"Invalid appid"`); surface
  `message` in the thrown Error.
- The App ID is a **required `password` preference**; without it the command shows a setup
  EmptyView with a primary action opening preferences.

## App architecture

- Commands: `wolfram-query` (live) and `wolfram-history` (saved). Both are `mode: view` entrypoints
  in `src/<name>.tsx`; the view components live in `src/components/`.
- `wolfram-query`: search bar text is the query (controlled `searchText` + `onSearchTextChange`,
  which disables built-in filtering); results are debounced 400 ms in `src/lib/use-wolfram-query.ts`.
- List view shows **text** results; Grid view shows **image** results. Toggled by in-component
  `mode` state (not a separate command). `WolframListView`/`WolframGridView` are reused by both the
  live query and the history detail (pass no `searchText`/`onSearchTextChange` for a static view
  with built-in filtering). Default view comes from a `defaultView` preference.
- The **input-interpretation pod** (`id === "Input"`) is filtered out of the items and rendered as a
  `List.Section`/`Grid.Section` title above the results (`isInputInterpretation` in `src/lib/wolfram.ts`).
- **Enter copies**: the primary action is the first `Action` with `autoFocus` — `CopyText`
  (`Action.CopyToClipboard`) in list mode, `CopyImage` in grid mode; Shift+Enter is the second
  action (toggle list/grid).
- Image copy downloads to a temp file then calls `Clipboard.copy({ file })` (portable; no
  `wl-copy`/`xclip` shelling). Text copy via `Action.CopyToClipboard` closes the window
  (built-in); image copy shows a toast instead.
- **History**: any copy action records the query's full result via `addToHistory`
  (`src/lib/history.ts`, `LocalStorage`, deduped by query, capped at 100). `wolfram-history` lists
  entries and `Action.Push` opens `WolframHistoryDetail`, which re-renders the saved results using
  the same list/grid views (no live fetch, no history re-recording).
- **Cross-navigation**: `src/wolfram-query.tsx` and `src/wolfram-history.tsx` are thin wrappers
  around `WolframQueryView`/`WolframHistoryList` (in `src/components/`). There is no cross-command
  `launchCommand` in `@vicinae/api`, so the views push each other via `useNavigation().push`
  ("Show History" in the query, "New Query" in the history list). The two view components import
  each other (a deliberate cycle — safe because they are `export function`s).
