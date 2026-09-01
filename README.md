# SKIIWA Launch Watch — 1-day intern experiment (closeout)

Public board: **https://skiiwa67-collab.github.io/solari-cookbook/**

This repo is a one-day intern experiment, not a product, and not a clone of [Solari](https://getsolari.com). We refused a credit card. We did not buy a Solari plan, we did not run their cloud browser or desktop, and we do not have (and do not invent) a Solari API key.

What actually shipped:

- The live glance is a static GitHub Pages site from `docs/`.
- Next-orbital facts come from public **Launch Library 2** (`ll.thespacedevs.com`). If that fetch fails, the board falls back to SAMPLE last-known Starlink Group 15-23. It is labeled. No invented NET.
- The SpaceX Starlink Group 15-23 browser job ran on **our own Chrome**, not Solari desktop. Playwright + local Google Chrome in [`examples/launch-session-local-chrome`](examples/launch-session-local-chrome) opened the official page (`https://www.spacex.com/launches/sl-15-23`) and wrote `docs/simulation/`. The board labels that SIMULATION · not Solari.
- [`examples/launch-watch-ts`](examples/launch-watch-ts) is leftover cookbook code for a stealth Solari browser. **It was not used for the public board.** There is no `slr_live_` key in this closeout.

Look lock (what the board is allowed to be):

- Signed night Falcon 9 on SLC-4E. The packer contains the still (never `object-fit: cover` the pad off). Leftover is night `#05060a`. Phone uses the 9×16 still.
- Rest is one French-binder spine on the left (CSS book: thickness, raised bands, gold). Live Launch Library 2 title down the spine; SKIIWA at the tail. Pull opens the signed notebook; shelf mark or Escape puts it back. Facts live in the book — no STATUS/NET/MISSION cards stapled on the pad.
- Spine rests off the engines. No DATA / SPECS / DESIGN overlay. AUTO is not a crane sketch.
- 4E is Vandenberg TE / strongback. Chopsticks stay at Starbase.
- No Solari clone. No LRT IAP mix.

This is a 1-day experiment closeout, not a forever product. First-time Pages: repo Settings → Pages → Source: GitHub Actions (`.github/workflows/pages.yml`).

## What we refused

- A Solari credit card / paid plan
- A Solari API key (`slr_live_…`)
- Running the Starlink 15-23 job on Solari cloud browser or Solari desktop
- Inventing payment, keys, or a Solari-shaped API in this README

The same *job* (open the real next-launch page in real Chrome, capture the session) ran locally. That is the whole point of the intern package: this public repo, not their stack.

## Leftover cookbook examples

This fork still contains the original short Solari Cookbook samples. They are not the live board. They are not how Starlink 15-23 was captured. Copy one only if you already have your own Solari account; this experiment does not provide a key.

### Cloud browser (upstream samples)

| Example | Language | What it shows |
| --- | --- | --- |
| [browser-quickstart-ts](examples/browser-quickstart-ts) | TypeScript | Launch a browser, open a page, read it |
| [browser-quickstart-py](examples/browser-quickstart-py) | Python | Launch a browser, open a page, read it |
| [browser-stealth-proxy-ts](examples/browser-stealth-proxy-ts) | TypeScript | Stealth mode + residential proxy egress |
| [browser-profiles-ts](examples/browser-profiles-ts) | TypeScript | Log in once, reuse the session forever |
| [browser-session-recording-py](examples/browser-session-recording-py) | Python | Record a session, download the replay |
| [launch-watch-ts](examples/launch-watch-ts) | TypeScript | Stealth Solari browser later. **Not used for the public board.** |
| [launch-session-local-chrome](examples/launch-session-local-chrome) | JavaScript | **What we actually ran:** Playwright + local Chrome. Refused their card. |

### Sandbox / desktop (upstream samples)

| Example | Language | What it shows |
| --- | --- | --- |
| [sandbox-quickstart-ts](examples/sandbox-quickstart-ts) | TypeScript | Run a command, write and read files |
| [sandbox-code-interpreter-py](examples/sandbox-code-interpreter-py) | Python | Stateful Python kernel for agent loops |
| [sandbox-port-preview-ts](examples/sandbox-port-preview-ts) | TypeScript | Expose a server in the VM on a public URL |
| [desktop-computer-use-py](examples/desktop-computer-use-py) | Python | Screenshot, click, and type on a Linux GUI |

## Running the job we actually ran

```bash
git clone https://github.com/skiiwa67-collab/solari-cookbook.git
cd solari-cookbook/examples/launch-session-local-chrome
npm install
npx playwright install chrome
npm start
```

No Solari key. Writes `docs/simulation/session.png`, optional `session.webm`, and `session.json`.

## Links

- Live board — https://skiiwa67-collab.github.io/solari-cookbook/
- Launch Library 2 — https://ll.thespacedevs.com/
- Official Starlink 15-23 page we opened — https://www.spacex.com/launches/sl-15-23
- Upstream cookbook (not this experiment) — https://github.com/solari-sdk/solari-cookbook

MIT licensed.
