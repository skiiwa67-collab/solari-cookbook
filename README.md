# Solari Cookbook

Short, runnable examples for [Solari](https://getsolari.com) — cloud browsers,
sandboxes, and desktops behind one API key.

Every example in this repo is a complete program you can run in under a minute.
They are deliberately small: one idea each, no framework, no scaffolding to read
past. Copy one into your project and change the parts you care about.

## Examples

### Cloud browser

| Example | Language | What it shows |
| --- | --- | --- |
| [browser-quickstart-ts](examples/browser-quickstart-ts) | TypeScript | Launch a browser, open a page, read it |
| [browser-quickstart-py](examples/browser-quickstart-py) | Python | Launch a browser, open a page, read it |
| [browser-stealth-proxy-ts](examples/browser-stealth-proxy-ts) | TypeScript | Stealth mode + residential proxy egress |
| [browser-profiles-ts](examples/browser-profiles-ts) | TypeScript | Log in once, reuse the session forever |
| [browser-session-recording-py](examples/browser-session-recording-py) | Python | Record a session, download the replay |
| [launch-watch-ts](examples/launch-watch-ts) | TypeScript | Stealth Solari browser later (`slr_live_...`). Not used for the public board. |
| [launch-session-local-chrome](examples/launch-session-local-chrome) | JavaScript | Same job on our computer: Playwright + local Chrome. Refused their card. |

### Sandbox

| Example | Language | What it shows |
| --- | --- | --- |
| [sandbox-quickstart-ts](examples/sandbox-quickstart-ts) | TypeScript | Run a command, write and read files |
| [sandbox-code-interpreter-py](examples/sandbox-code-interpreter-py) | Python | Stateful Python kernel for agent loops |
| [sandbox-port-preview-ts](examples/sandbox-port-preview-ts) | TypeScript | Expose a server in the VM on a public URL |

### Desktop

| Example | Language | What it shows |
| --- | --- | --- |
| [desktop-computer-use-py](examples/desktop-computer-use-py) | Python | Screenshot, click, and type on a Linux GUI |

## Public glance

The SKIIWA next-launch board is a static GitHub Pages site from `docs/`.

- URL — https://skiiwa67-collab.github.io/solari-cookbook/
- Look lock — night F9 on SLC-4E (`docs/solari-f9-4e-16x9.png` / `9x16`). Animations and clicks live on that frame: arms, trench, moon, path.
- French-binder spine on the LEFT of Falcon 9 (raised bands, gold, aged leather). Pull it off the shelf, then it opens as a curling folio. Eight plates: CMD CDT TEL STS PAD VID MSK AUTO. Skip-to-tab flips every intervening page. Open book stays left of the vehicle and never covers the engines. VID plays in the book; maximize docks right of Falcon 9 and is the only time that feed appears. Live next orbital from public Launch Library 2. If LL2 fails, SAMPLE last-known Starlink Group 15-23. Not Solari. No Mechazilla on 4E. The locked F9-on-4E still is sparked by [vgpu](https://vgpu.sh/docs) shaders (pad twinkle, ground vapor, trench flame only). The TE/strongback highlight is brass construction ink, not a fireball on the stack. If WebGPU is missing (Android / some Pages clients), the CSS layers stay. Not a video.
- Simulation — we refused their card. The same agent-browser job (open the real next-launch page in real Chrome, capture the session) runs on our own computer via [`examples/launch-session-local-chrome`](examples/launch-session-local-chrome). Playwright + local Chrome. **Not Solari.** No stealth, proxy, captcha, or microVM product. The board keeps that feed inside the VID plate until maximize.

First-time Pages: repo Settings → Pages → Source: GitHub Actions (workflow in `.github/workflows/pages.yml`).

## Running an example

Each directory is self-contained.

```bash
git clone https://github.com/solari-sdk/solari-cookbook.git
cd solari-cookbook/examples/browser-quickstart-ts

npm install                          # or: pip install -r requirements.txt
export SOLARI_API_KEY=slr_live_...   # grab one at console.getsolari.com
npm start                            # or: python main.py
```

One `slr_live_` key works across browsers, sandboxes, and desktops, and every
product bills to the same balance.

## Which product do I want?

- **Cloud browser** — you need a *web page*: scraping, testing, filling forms,
  anything Playwright or Puppeteer would do locally. Adds stealth, managed
  proxies, captcha solving, profiles, and session recording.
- **Sandbox** — you need to *run code*: an LLM's Python, an untrusted build, a
  data job. A headless microVM that boots from a snapshot in about a second.
- **Desktop** — you need a *screen*: computer-use agents, GUI apps, anything
  that has to be clicked. A sandbox plus X11 and a live VNC stream.

## Gotchas the examples encode

Things that cost you an afternoon if you meet them cold:

- **TypeScript: call `await solari.close()`.** The browser client keeps a
  loopback proxy open for connection retries. Skip the close and your script
  prints its output and then hangs forever instead of exiting.
- **Recording is per session, not per account.** Pass `recording: true` when you
  create the session; without it the replay endpoint 404s forever. The upload is
  async after release, so poll for ~30s before giving up.
- **Sandbox commands are not shell-interpreted.** `run("ls -la")` looks for a
  binary named `ls -la`. Put argv in `args`, or run `sh -c` explicitly.
- **`kill()`, not `close()`, ends a VM.** `close()` drops your local control
  channel; the VM keeps running until its idle timeout.
- **`timeoutMs` is a rolling idle window**, not a hard deadline — it resets on
  every use.

## Links

- Docs — [docs.getsolari.com](https://docs.getsolari.com)
- Console — [console.getsolari.com](https://console.getsolari.com)
- Changelog — [changelog.getsolari.com](https://changelog.getsolari.com)
- Questions — [hello@getsolari.com](mailto:hello@getsolari.com)

## Contributing

New examples are welcome. Keep them small, make them run end-to-end against the
real API, and put anything surprising in a comment right where it bites.

MIT licensed.
