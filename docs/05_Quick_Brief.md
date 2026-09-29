# NWIS: Quick Brief (read this first, 3 minutes)

## The problem in 3 lines
- Oil India's **eRTMAC** shows live data from the well being drilled **now**.
- The lessons from **nearby wells** (mud losses, stuck pipe, kicks) are buried in old PDFs, scans and people's memory.
- So problems that could be predicted are met **after** they happen, which means lost rig time (**NPT**).

## Our answer in 1 line
**NWIS remembers every nearby well and warns the driller *before* the bit reaches a known trouble depth, with what worked last time.**

## The 4 ideas
1. **Read**: AI reads old reports (OCR + NLP) and turns them into data.
2. **Remember**: one searchable knowledge base, every record linked to its source page.
3. **Correlate**: compare wells by **formation** (the same rock), not raw depth.
4. **Alert**: look 200 m ahead of the bit and warn early.

## Each page in one line
| Page | What it does | Why it matters |
|---|---|---|
| **Overview** | Where the well is + the next risk ahead | Everything important in 5 seconds |
| **Nearby Wells Map** | 3D wells around the rig, adjustable radius | "Which wells are near us?" answered visually |
| **Live Drilling** ⭐ | Replay of drilling data + early alerts | Warns ~160 m **before** the problem, with the fix |
| **Offset Correlation** | Wells side by side, lined up by formation | Shows patterns ("everyone lost mud at the Barail top") |
| **Ask NWIS** | Ask questions in plain words | Answers with the exact report and page as proof |
| **Knowledge Search** | Search and filter every past problem | Hours of reading become seconds |
| **Well Records** | Full history of any one well | All reports on one page |
| **Document AI** | Scanned report → structured data | Shows *how* the knowledge is collected |
| **Risk Dashboard** | Field-wide charts for the office | Planning + shows time that can be saved |

## Top bar buttons
- **Guided demo**: auto-walkthrough (use this in the video).
- **Field / Office**: big simple screens for the rig vs. full analytics.
- **हिंदी**: Hindi interface. **Sun/moon**: light/dark.
- **Bell**: alerts. **Search (Ctrl+K)**: find anything.

## Words you'll say
- **Offset well** = an already-drilled nearby well.
- **NPT** = non-productive (lost) rig time.
- **Formation** = a rock layer (Tipam, Barail, Kopili…).
- **Mud loss** = drilling fluid lost into the rock. **Kick** = gas/fluid entering the well. **Stuck pipe** = the drill string gets stuck.
- **LCM** = material pumped to plug losses. **MW** = mud weight.

## If asked "is it real?"
Demo uses **sample data** modelled on Upper Assam geology. The design is ready to plug in Oil India's real reports and the **live eRTMAC feed**.

## How the prediction works (1 breath)
"For each depth ahead, we find the same spot in the same formation in nearby wells, count the problems there, weight closer and more severe ones higher, and turn that into a probability. Every % shows its evidence."
