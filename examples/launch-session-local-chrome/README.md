# Launch session — local Chrome (not Solari)

This is the same *job* a Solari cloud browser would do — drive a real Chrome, open the next-launch page, capture the session — run on **this computer**. It is **not** Solari. No `slr_live_` key. No stealth, proxy, captcha, or microVM product. We refused their card.

```bash
cd examples/launch-session-local-chrome
npm install
npx playwright install chrome
npm start
```

Writes `docs/simulation/session.png`, optional `session.webm`, and `session.json` for the GitHub Pages board.

The board labels this **SIMULATION · local Chrome · not Solari**.
