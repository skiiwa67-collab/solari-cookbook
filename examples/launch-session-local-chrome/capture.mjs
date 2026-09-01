/**
 * Agent-driven real Chrome. Not Solari.
 * Opens the public next-launch page (webcast or LL2 listing) and captures
 * a session for the GitHub Pages board.
 */
import { copyFileSync, mkdirSync, readdirSync, renameSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const OUT = resolve(fileURLToPath(new URL("../../docs/simulation", import.meta.url)))
const LL2 =
  "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=12&mode=detailed&hide_recent_previous=true"

function isOrbital(row) {
  const orbit = row.mission && row.mission.orbit
  if (!orbit) return false
  return String(orbit.name || orbit.abbrev || "").toLowerCase() !== "suborbital"
}

function pickNext(rows) {
  const done = /success|failure|partial/i
  return (
    (rows || []).find((row) => {
      const st = String((row.status && (row.status.abbrev || row.status.name)) || "")
      return !done.test(st) && isOrbital(row)
    }) || null
  )
}

function pickUrl(row) {
  const official = (row.infoURLs || []).find((u) => u && u.url)
  const webcast = (row.vidURLs || []).find((u) => u && u.url)
  const slug = row.slug
  if (official && official.url) return { href: official.url, kind: "official page" }
  if (webcast && webcast.url) return { href: webcast.url, kind: "webcast" }
  if (slug) return { href: `https://spacelaunchlive.com/launches/${slug}/`, kind: "public listing" }
  return { href: "https://nextspaceflight.com/launches/", kind: "public listing" }
}

const ll2 = await fetch(LL2, { cache: "no-store" })
if (!ll2.ok) throw new Error("LL2 " + ll2.status)
const body = await ll2.json()
const row = pickNext(body.results)
if (!row) throw new Error("no upcoming orbital launch")
const target = pickUrl(row)

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
})
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
  ignoreHTTPSErrors: true,
})
const page = await context.newPage()
const started = new Date().toISOString()
try {
  await page.goto(target.href, { waitUntil: "domcontentloaded", timeout: 45_000 })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: resolve(OUT, "session.png"), fullPage: false })
} finally {
  const vid = page.video()
  await context.close()
  await browser.close()
  let recording = null
  if (vid) {
    const vpath = await vid.path()
    if (vpath) {
      const dest = resolve(OUT, "session.webm")
      try {
        renameSync(vpath, dest)
      } catch {
        copyFileSync(vpath, dest)
      }
      recording = "session.webm"
    }
  }
  for (const name of readdirSync(OUT)) {
    if (name.endsWith(".webm") && name !== "session.webm") {
      try {
        renameSync(resolve(OUT, name), resolve(OUT, "session.webm"))
        recording = "session.webm"
      } catch (_) {}
    }
  }
  writeFileSync(
    resolve(OUT, "session.json"),
    JSON.stringify(
      {
        simulation: true,
        notSolari: true,
        engine: "Playwright + local Google Chrome",
        refusedCard: true,
        capturedAt: started,
        url: target.href,
        kind: target.kind,
        mission: (row.mission && row.mission.name) || row.name,
        screenshot: "session.png",
        recording,
      },
      null,
      2,
    ) + "\n",
  )
}

console.error("Wrote simulation to", OUT)
console.error("Opened", target.kind, target.href)
