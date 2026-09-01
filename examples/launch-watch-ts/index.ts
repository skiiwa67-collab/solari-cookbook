/**
 * Launch Watch — stealth cloud browser that reads PUBLIC launch pages
 * and prints JSON for the next upcoming orbital launch.
 *
 * Best-effort parse of published text only. Never invent times, pads,
 * or a status the page did not write. Missing fields are null.
 */
import { Solari } from "@solarisdk/browser"

const NSF = "https://nextspaceflight.com/launches/"
const SFN = "https://spaceflightnow.com/launch-schedule/"

type Status = "go" | "hold" | "tbd" | "unknown"

type Fields = {
  mission: string | null
  vehicle: string | null
  pad: string | null
  net: string | null
}

type LaunchStatus = Fields & {
  status: Status
  sources: string[]
}

function blank(): Fields {
  return { mission: null, vehicle: null, pad: null, net: null }
}

function clean(s: string | null | undefined): string | null {
  if (!s) return null
  const t = s.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
  return t.length ? t : null
}

function isThin(row: Fields): boolean {
  return !row.mission || !row.vehicle || !row.pad || !row.net
}

function classifyStatus(...parts: (string | null)[]): Status {
  const blob = parts.filter(Boolean).join(" ")
  if (!blob) return "unknown"
  const lower = blob.toLowerCase()

  // Current hold/scrub wording — not historical "Delayed from …"
  if (/\b(on hold|hold in effect|currently on hold|scrubbed)\b/.test(lower)) return "hold"
  if (/\bhold\b/.test(lower) && /\b(currently|still|remains|in effect)\b/.test(lower)) return "hold"

  if (/\b(tbd|to be determined|no earlier than|\bnet\b)\b/i.test(blob)) return "tbd"

  const hasClock =
    /\bwindow opens\b/i.test(blob) ||
    /\b\d{1,2}:\d{2}\b/.test(blob) ||
    /\b\d{3,4}\s*utc\b/i.test(blob)
  if (/\bgo(?:\s+for\s+launch)?\b/i.test(blob) || hasClock) return "go"
  return "unknown"
}

function namesMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\b(group|mission|nasa s|the|and)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  const na = norm(a)
  const nb = norm(b)
  if (!na || !nb) return false
  if (na === nb || na.includes(nb) || nb.includes(na)) return true
  const tok = (s: string) => new Set(s.split(" ").filter((t) => t.length > 1))
  const A = tok(na)
  const B = tok(nb)
  let n = 0
  for (const t of A) if (B.has(t)) n++
  const min = Math.min(A.size, B.size)
  return min > 0 && n >= Math.min(2, min)
}

function merge(primary: Fields, secondary: Fields | null): Fields {
  if (!secondary) return primary
  const same = !primary.mission || namesMatch(primary.mission, secondary.mission)
  if (!same) return primary
  return {
    mission: primary.mission ?? secondary.mission,
    vehicle: primary.vehicle ?? secondary.vehicle,
    pad: primary.pad ?? secondary.pad,
    net: primary.net ?? secondary.net,
  }
}

const SKIP_LINE =
  /^(up next|launches|add filter|upcoming|previous|details|watch|search|next spaceflight|get the app)$/i

const PAD_HINT =
  /space force|space centre|space center|cosmodrome|peninsula|starbase|kennedy|cape canaveral|vandenberg|baikonur|jiuquan|wenchang|guiana|tanegashima|and[øo]ya|satish|m[āa]hia|kourou|naro |alc[aâ]ntara|wallops|kodiak|europe's spaceport/i

const NET_HINT =
  /\b(net|tbd|utc|gmt|go|hold|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|window|q[1-4]|t-\s*\d)\b/i

/** First upcoming card from Next Spaceflight's rendered listing text. */
function parseNsfText(text: string): Fields {
  const start = text.search(/Up Next/i)
  const slice = start >= 0 ? text.slice(start) : text
  const lines = slice
    .split(/\n+/)
    .map((l) => clean(l))
    .filter((l): l is string => !!l && !SKIP_LINE.test(l))

  const vehicleLine = lines.find((l) => {
    const parts = l.split("|").map((p) => p.trim())
    return parts.length === 2 && parts[0].length >= 2 && parts[0].length <= 48 && parts[1].length >= 2 && parts[1].length <= 40
  })

  const i = vehicleLine ? lines.indexOf(vehicleLine) : 0
  const block = lines.slice(Math.max(0, i - 3), i + 6)

  const vehicle = vehicleLine ? clean(vehicleLine.split("|")[0]) : null
  const pad = block.find((l) => PAD_HINT.test(l)) ?? null
  const net =
    block.find((l) => NET_HINT.test(l) && !/\|/.test(l) && l !== pad) ?? null
  const mission =
    block.find(
      (l) =>
        l !== vehicleLine &&
        l !== pad &&
        l !== net &&
        !/\|/.test(l) &&
        l.length >= 3 &&
        l.length <= 80 &&
        !/^(space[x]|rocket lab|isro|ula|casc|roscosmos|avio|nasa|isar|astra)$/i.test(l),
    ) ?? null

  return { mission, vehicle, pad, net }
}

type SfnEntry = { date: string | null; mission: string | null; data: string | null }

function parseSfnEntries(entries: SfnEntry[]): Fields[] {
  return entries.map((e) => {
    const missionLine = clean(e.mission)
    let vehicle: string | null = null
    let mission: string | null = null
    if (missionLine) {
      const parts = missionLine.split(/\s*[•·]\s*/)
      if (parts.length >= 2) {
        vehicle = clean(parts[0])
        mission = clean(parts.slice(1).join(" • "))
      } else {
        mission = missionLine
      }
    }
    const data = e.data ?? ""
    const time = clean(data.match(/Launch time:\s*([\s\S]*?)(?:Launch site:|$)/i)?.[1] ?? null)
    const pad = clean(data.match(/Launch site:\s*([\s\S]*?)$/i)?.[1] ?? null)
    const date = clean(e.date)
    const net = date && time ? `${date}; ${time}` : time ?? date
    return { mission, vehicle, pad, net }
  })
}

/** If Spaceflight Now's usual class names are gone, read the published labels. */
function parseSfnTextFallback(text: string): Fields[] {
  const re =
    /((?:NET|TBD)\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}(?:\/\d{1,2})?)(?:,\s*\d{4})?\s+([^\n]+?)\s+[•·]\s+([^\n]+?)\s+Launch time:\s+([^\n]+?)\s+Launch site:\s+([^\n]+)/gi
  const rows: Fields[] = []
  for (const m of text.matchAll(re)) {
    const date = clean(`${m[1] ?? ""}${m[2]} ${m[3]}`)
    const time = clean(m[6])
    rows.push({
      mission: clean(m[5]),
      vehicle: clean(m[4]),
      pad: clean(m[7]),
      net: date && time ? `${date}; ${time}` : time ?? date,
    })
  }
  return rows
}

function pickSfn(primary: Fields, rows: Fields[]): Fields | null {
  if (!rows.length) return null
  if (!primary.mission) return rows[0]
  return rows.find((r) => namesMatch(primary.mission, r.mission)) ?? null
}

const apiKey = process.env.SOLARI_API_KEY
if (!apiKey) {
  console.error("Set SOLARI_API_KEY — get a free key at https://console.getsolari.com")
  process.exit(1)
}

const solari = new Solari({ apiKey })
const sources: string[] = []
let row = blank()

const browser = await solari.launch({ stealth: true })
try {
  const page = await browser.newPage()

  await page.goto(NSF, { waitUntil: "domcontentloaded", timeout: 60_000 })
  sources.push(NSF)
  // Next Spaceflight hydrates cards after the skeleton; wait for real text.
  await page
    .waitForFunction(
      () => /\|/.test(document.body.innerText) && !document.querySelector('[data-slot="skeleton"]'),
      { timeout: 45_000 },
    )
    .catch(() => {})

  row = parseNsfText(await page.evaluate(() => document.body.innerText))

  if (isThin(row)) {
    await page.goto(SFN, { waitUntil: "domcontentloaded", timeout: 60_000 })
    sources.push(SFN)
    await page.waitForSelector(".datename, .launchdate", { timeout: 30_000 }).catch(() => {})

    const entries = await page.evaluate(() => {
      const tidy = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim()
      return [...document.querySelectorAll(".datename")].map((el) => {
        const date = el.querySelector(".launchdate")?.textContent ?? ""
        const mission = el.querySelector(".mission")?.textContent ?? ""
        const sib = el.nextElementSibling
        const data = sib?.classList.contains("missiondata") ? (sib.textContent ?? "") : ""
        return { date: tidy(date), mission: tidy(mission), data: tidy(data) }
      })
    })

    let parsed = parseSfnEntries(entries)
    if (!parsed.length) {
      parsed = parseSfnTextFallback(await page.evaluate(() => document.body.innerText))
    }
    row = merge(row, pickSfn(row, parsed))
  }

  const out: LaunchStatus = {
    ...row,
    status: classifyStatus(row.mission, row.vehicle, row.pad, row.net),
    sources,
  }
  console.log(JSON.stringify(out, null, 2))
} finally {
  await browser.close()
  // REQUIRED in Node, and easy to miss: the client keeps a loopback proxy
  // server open for the connection-retry path, and that handle keeps the
  // event loop alive. Skip this and the script prints JSON then hangs.
  await solari.close()
}
