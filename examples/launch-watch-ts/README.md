# Launch Watch (TypeScript)

A stealth Solari cloud browser that reads public orbital-launch listings — [Next Spaceflight](https://nextspaceflight.com/launches/) first, then [Spaceflight Now](https://spaceflightnow.com/launch-schedule/) if that page is thin — and prints the next upcoming mission as JSON. Best-effort parse of published text only; missing fields are `null`. Demo for Chris Olsen (SKIIWA).

The public glance at [`docs/index.html`](../../docs/index.html) reads that JSON. Until a live run, it loads [`docs/next-launch.sample.json`](../../docs/next-launch.sample.json) (SAMPLE / example data — empty fields, no invented NET).

## Run later with a live key

Get a free API key at https://console.getsolari.com, then:

```bash
cd examples/launch-watch-ts
npm install
export SOLARI_API_KEY=slr_live_...
npm start
```

`npm start` prints JSON and writes `docs/next-launch.json` — the file the glance prefers over the SAMPLE file. Do not invent times; missing fields stay `null`.

Note the `solari.close()` in the `finally` block — without it the process prints JSON and then hangs instead of exiting.

Source: [`index.ts`](index.ts)
