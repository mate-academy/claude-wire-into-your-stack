---
name: ems-cardio-review
description: Reviews Eric's cardio sessions from DB:Cardio in Notion. Use this skill whenever Eric shares cardio workout data, says "cardio review", "review today's cardio", "review my cardio session", "ems-cardio-review", or provides a date like "ems-cardio-review 6/5/26". Always trigger when Eric asks about a cardio session — even casually ("how did my cardio look today?", "how was my session?", "check my workout"). Default to today's date if no date is given. Pulls session data from Notion, summarizes the session, compares to recent history, and compares to same-format sessions.
---

# ems-cardio-review

Reviews Eric's cardio sessions from DB:Cardio in Notion. Produces a structured session summary, recent history comparison, and same-format comparison, then writes a summary entry to DB:Journal.

## DB:Cardio Reference

- **Database ID**: `1730755826b78037bf7dd921366808a2`
- **Collection/Data Source ID**: `collection://7f5b496d-58ed-4144-93fc-e9c240115524`
- **View URL**: `view://6029618c-276f-479e-8be6-3f539e5e09b3`
- Each session = multiple rows (one per segment/machine)
- Rows for the same session share the same `date:Date:start` and `Program` values

## Key Fields

| Field | Notes |
|-------|-------|
| `date:Date:start` | Session date (ISO format) |
| `Session` | Type: Cardio, Day 1, Day 2, Arms/PT, Off Day workout |
| `Program` | Format: 3x15, 20/20, 20/25, etc. |
| `Type` | Machine: Stairmaster, Octane Elliptical, Treadmill, etc. |
| `Order` | Segment order within session (1, 2, 3, or After) |
| `Min` / `Sec` | Duration |
| `Avg HR` | Average heart rate |
| `Cal Burn` | Active calories |
| `Effort` | Effort rating (1–10) |
| `Settings` | Machine settings (level, resistance, speed) |
| `Notes` | Eric's own session notes |
| `Location` | Golds - Broad St or Golds - Gayton |

## HR Zone Reference (Max HR = 187)

| Zone | BPM Range | Name |
|------|-----------|------|
| 1 | 94–112 | Recovery |
| 2 | 112–131 | Fat Burn / Base Aerobic |
| 3 | 131–150 | Aerobic |
| 4 | 150–168 | Threshold |
| 5 | 168–187 | Max / VO2 Max |

## Session Targets by Type

| Session Type | HR Target | Zone |
|-------------|-----------|------|
| Cardio (Day 1) | 150–168 bpm | Zone 4, touching 5 |
| Post-lift (Day 2) | 105–115 bpm | Zone 1–2 |
| Arms/PT cardio | 95–115 bpm | Zone 1–2 |

## Standard Cardio Formats

| Format | Structure | Total Time |
|--------|-----------|------------|
| 3x15 | Stairmaster 15 / Elliptical 15 / Stairmaster 15 | ~45 min |
| 20/20 | Stairmaster 20 / Elliptical 20 | ~40 min |
| 20/25 | Stairmaster 20 / Elliptical 25 | ~45 min |

---

## Workflow

### Step 1 — Determine Target Date

- If no date given, use today's date (EDT)
- If date given (e.g. "6/5/26"), parse and convert to ISO format (2026-06-05)

### Step 2 — Fetch Session Data

Query DB:Cardio via Notion MCP using the view URL. Filter for rows matching the target date.

If no rows found for the target date, say so clearly and stop.

`RESULT: no_action`

### Step 3 — Fetch Recent History

Pull the last 20 rows from the view. From these, identify:
- The **5 most recent Cardio sessions** (Session = "Cardio" only) by date, excluding today
- The **5 most recent sessions with the same Program/format** as today's session

A "session" = all rows sharing the same date. Group rows by date to reconstruct full sessions.

### Step 4 — Build the Review

Output the review in this structure:

---

#### 📅 Cardio Session — [Date]

**Session Type**: [Cardio / Day 2 / Arms/PT] | **Format**: [Program] | **Location**: [Location]

**Segment Breakdown**

| # | Machine | Duration | Avg HR | Zone | Cal | Effort | Settings | Notes |
|---|---------|----------|--------|------|-----|--------|----------|-------|
| 1 | ... | ... | ... | ... | ... | ... | ... | ... |
| 2 | ... | ... | ... | ... | ... | ... | ... | ... |
| 3 | ... | ... | ... | ... | ... | ... | ... | ... |

Notes column interpretation:
- Stairmaster pyramid like "10/12 9/5 8/3" = level/minutes — display as-is
- Elliptical like "54/162" = machine cal / avg HR — display as-is
- Timestamps, personal flags — display as-is
- If empty, leave blank

**Session Totals**
- Total cardio time: X min (exclude cooldown/treadmill segments)
- Total active cal: X (cardio segments only)
- Cal/min: X.X (total cardio cal ÷ total cardio minutes, rounded to 1 decimal)
- Overall avg HR: X bpm (weighted by duration)
- HR zone: Zone X ([name])
- Vs. target ([target range]): on target / above / below

---

#### 📊 Recent Cardio Session Comparison (Last 5 Cardio Sessions)

Only include sessions where Session = "Cardio" — exclude Day 2, Arms/PT, Day 1 post-lift since those target 95–115 bpm and are not comparable.

| Date | Format | Avg HR | Cal | Duration | Cal/Min | Effort |
|------|--------|--------|-----|----------|---------|--------|
| ... | ... | ... | ... | ... | ... | ... |

Brief narrative: trends in HR, calories, cal/min efficiency, effort.

---

#### 🔁 Same-Format Comparison ([Program] sessions)

| Date | Avg HR | Cal | Duration | Cal/Min | Effort | Notes |
|------|--------|-----|----------|---------|--------|-------|
| ... | ... | ... | ... | ... | ... | ... |

Brief narrative: performance vs. previous same-format sessions. Flag if HR, cal/min, or effort trending up/down/flat.

---

#### 💡 Observations

2–4 bullet points covering:
- Zone adherence vs. target for session type
- Pacing quality across segments (HR curve — did it build, hold, fade?)
- Any flags (effort/HR mismatch, notable settings, Eric's own flags from notes)
- One positive observation and one area to watch if applicable

---

### Step 5 — Write Journal Entry to DB:Journal

After completing the review output, write a summary entry to DB:Journal.

**DB:Journal Reference**
- **Database ID**: `86a24ca6261d48a1ac3595e9800ececd`
- **Collection/Data Source ID**: `collection://ead1f95c-c83e-470b-938e-e8a427a8cadd`
- **Key fields**: `EntryDate` (date), `Seq` (number), `MainTag` (text), `SubTag` (text), `Description` (title), body content

**Process**

1. Search DB:Journal for an entry matching:
   - `EntryDate` = target date
   - `MainTag` = Fitness
   - `SubTag` = Cardio

   Use `notion-search` with query "Fitness Cardio [date]" and `data_source_url: collection://ead1f95c-c83e-470b-938e-e8a427a8cadd`. Fetch the result to confirm MainTag=Fitness, SubTag=Cardio, and get the Seq value.

2. If no matching entry found:
   - Alert: "⚠️ No Fitness/Cardio journal entry found for [date] — possible date mismatch. Journal summary not created."
   - Stop.

   `RESULT: error`

3. If found, create a new DB:Journal page with:
   - `EntryDate` = target date
   - `Seq` = found Seq + 1
   - `MainTag` = Fitness
   - `SubTag` = Cardio Summary
   - `Description` = narrative one-line summary, 25+ words, ending with total cardio minutes and cal/min. Example: "Strong 20/20 session at Golds Broad St — averaged 166 bpm across both segments, stairmaster at personal-high 9.45, solid Zone 4 effort with consistent pacing throughout. 41 min, 10.1 cal/min."
   - Body = full formatted skill output exactly as displayed in chat (all sections, tables, bullets)

4. Confirm: "✅ Journal entry created — [Date], Seq [N], Cardio Summary"

`RESULT: ok`

If any unhandled error occurs (MCP call fails, unexpected data shape, etc.), output the error details and end with:

`RESULT: error`

---

## Notes & Edge Cases

- **No session today**: Say "No cardio logged for [date]" and offer to look at the most recent session instead
- **Post-lift / Arms/PT sessions**: Use the correct HR target (95–115) not the Cardio target (150–168)
- **Weighted avg HR**: Weight by duration (Min field), not simple average of segment HRs
- **Cal/min**: Cardio segments only — exclude cooldown/treadmill Order="After" rows from both numerator and denominator
- **Same-format comparison**: If fewer than 3 matching-format sessions exist in history, note that and use what's available
- **Treadmill cooldown rows**: Order = "After" — include in segment table but exclude from cal/min and total cardio time calculations
- **Settings field**: Stairmaster = speed (e.g. "9", "9.45"); elliptical = resistance/program (e.g. "RND 10", "Man 6") — include as-is
