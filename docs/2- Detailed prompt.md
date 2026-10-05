# Read member ART200 from SAMSRC1/QRPGLESRC.

Generate concise technical documentation covering:
1. Program purpose and display file used
2. The panel-step state machine pattern (panel, step01, step02 variables with values: prp/lod/dsp/key/chk/act)
3. Key business rules (VAT calculation, soft-delete with ARDEL field, article validation)
4. Files used (input, output, update)

Save as docs/ART200-documentation.md

---

**Status:** active  **Date:** 2026-09-29

---

### 👤 User

Read member ART200 from SAMSRC1/QRPGLESRC.

Generate concise technical documentation covering:
1. Program purpose and display file used
2. The panel-step state machine pattern (panel, step01, step02 variables with values: prp/lod/dsp/key/chk/act)
3. Key business rules (VAT calculation, soft-delete with ARDEL field, article validation)
4. Files used (input, output, update)

Save as docs/ART200-documentation.md

---

### 🤖 Assistant

> 🔧 called: read_member



> 🔧 **read_member** — {"library":"SAMSRC1","file":"QRPGLESRC","member":"ART200","extension":"RPGLE"}

### 🤖 Assistant

> 🔧 called: read_member



> 🔧 **read_member** — {"extension":"SQLRPGLE","file":"QRPGLESRC","library":"SAMSRC1","member":"ART200"}

### 🤖 Assistant

> 🔧 called: search_qsys

Now let me also read the `/copy familly` copybook to understand the shared fields and functions:

> 🔧 **search_qsys** — SAMSRC1

### 🤖 Assistant

> 🔧 called: search_qsys



> 🔧 **search_qsys** — SAMSRC1

### 🤖 Assistant

> 🔧 called: read_member



> 🔧 **read_member** — {"extension":"RPGLEINC","file":"QPROTOSRC","library":"SAMSRC1","member":"FAMILLY"}

### 🤖 Assistant

> 🔧 called: search_qsys

Now let me also look at the ARTICLE1 and ARTICLE2 physical file DDS to understand the fields:

> 🔧 **search_qsys** — SAMSRC1

### 🤖 Assistant

> 🔧 called: read_member, read_member



> 🔧 **read_member** — {"extension":"PF","file":"QDDSSRC","library":"SAMSRC1","member":"ARTICLE"}

> 🔧 **read_member** — {"extension":"LF","file":"QDDSSRC","library":"SAMSRC1","member":"ARTICLE2"}

### 🤖 Assistant

> 🔧 called: read_member



> 🔧 **read_member** — {"extension":"LF","file":"QDDSSRC","library":"SAMSRC1","member":"ARTICLE1"}

### 🤖 Assistant

> 🔧 called: search_qsys

Now let me look at the SAMREF file to understand the reference field definitions (VATCODE, DLCODE, etc.):

> 🔧 **search_qsys** — SAMSRC1

### 🤖 Assistant

> 🔧 called: read_member



> 🔧 **read_member** — {"extension":"PF","file":"QDDSSRC","library":"SAMSRC1","member":"SAMREF"}

### 🤖 Assistant

> 🔧 called: search_qsys

Now let me check the display file ART200D:

> 🔧 **search_qsys** — SAMSRC1

### 🤖 Assistant

> 🔧 called: read_member



> 🔧 **read_member** — {"extension":"DSPF","file":"QDDSSRC","library":"SAMSRC1","member":"ART200D"}

### 🤖 Assistant

> 🔧 called: write_file

Now I have all the information needed. Let me write the documentation:

> 🔧 **write_file** — docs/ART200-documentation.md

### 🤖 Assistant

The documentation has been saved to [`docs/ART200-documentation.md`](docs/ART200-documentation.md). Here's a summary of what was captured:

---

### 1. Program Purpose and Display File
**ART200** is an SQLRPGLE interactive maintenance program for the Articles master file, bound to the `SAMPLE` binding directory. It uses display file **ART200D** with three panels: a 14-record subfile list (`CTL01`/`SFL01`), a detail form (`FMT02`), and a free-text information panel (`FMT03`).

---

### 2. Panel-Step State Machine
Three state variables control flow: `panel` (integer 1–3, 0=exit), `step01`/`step02`/`step03` (3-char). All steps cycle through six named constants:

| Constant | Meaning |
|---|---|
| `prp` | Prepare/reset |
| `lod` | Load subfile from file |
| `dsp` | Display screen, wait |
| `key` | Process function keys |
| `chk` | Validate input |
| `act` | Execute DB action |

A Mermaid state diagram is included in the doc showing all transitions across all three panels.

---

### 3. Key Business Rules
- **Soft-delete:** Option 4 sets `ARDEL = 'X'` on the `ARTICLE` record — no physical delete ever occurs
- **VAT:** The program stores only `ARVATCD` (1-char code); the display file resolves the rate (`VATRATE`) and description (`VATDESC`) from `VATDEF` at render time
- **Article validation:** Description mandatory + family code must exist via `existArtFam()` (indicators 41 and 40)
- **Auto-increment ID:** Reads last record with `SETGT *HIVAL` + `READP`, increments numerically, retries on duplicate key
- **Audit stamp:** Every write/update records `ARMOD=%timestamp()` and `ARMODID=*USER`

---

### 4. Files Used
- **`article2` (LF)** — Input, keyed by `ARDESC,ARID` for alphabetical subfile browsing
- **`article1` (LF)** — Update/Add, keyed by `ARID` for chain/update/write
- **`art200d` (DSPF)** — Workstation combined file
- **`ARTIINF` (SQL table)** — Free-text article info managed via embedded SQL (Panel 3)
- **`ART201`** — External program for supplier management (option 6)