# /document-rpg-member ART300 SAMSRC1

---

**Status:** active  **Date:** 2026-09-29

---

### 👤 User

---
name: document-rpg-member
description: Generate technical documentation for an SQLRPGLE/RPGLE member
metadata:
  user-invocable: true
  disable-model-invocation: true
  argument-hint: <MEMBER> <LIBRARY>
---

Read member $1 from $2/QRPGLESRC.

Then investigate all referenced objects needed to understand the program:
- The display file (DSPF) used by the program — read its DDS source from $2/QDDSSRC
- Any `/copy` or `/include` copybooks referenced — search for them across $2
- Physical files (PF) and logical files (LF) referenced — read their DDS from $2/QDDSSRC
- The reference file (e.g. SAMREF) to understand field definitions

Generate concise technical documentation covering:
1. **Program purpose and display file used** — what the program does, which DSPF it uses, and what screen formats it defines
2. **The panel-step state machine pattern** — document the `panel`, `step01`, `step02` (and further step variables if present) with their possible values (`prp`/`lod`/`dsp`/`key`/`chk`/`act`), include a Mermaid state diagram showing all transitions
3. **Key business rules** — document validation logic, soft-delete patterns (ARDEL/DLCODE), auto-generated keys, audit stamping (ARMOD/ARMODID/ARCREA), VAT calculations, embedded SQL patterns, and any external program calls
4. **Files used** — table of all files (input, output, update) with their physical file, open mode, key structure, and purpose; include any SQL tables accessed via embedded SQL and any external programs called

Save the documentation as `docs/$1-documentation.md`.


ART300 SAMSRC1

---

### 🤖 Assistant

> 🔧 called: use_skill



> 🔧 **use_skill** — rpg-primer-basics

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Read ART300 member from SAMSRC1/QRPGLESRC
[ ] Identify display file (DSPF) referenced and read its DDS source from SAMSRC1/QDDSSRC
[ ] Find and read /copy or /include copybooks referenced in ART300
[ ] Find and read physical/logical file DDS sources from SAMSRC1/QDDSSRC
[ ] Identify reference file (e.g. SAMREF) and read field definitions
[ ] Generate technical documentation and save to docs/ART300-documentation.md


### 🤖 Assistant

> 🔧 called: read_member



> 🔧 **read_member** — {"library":"SAMSRC1","file":"QRPGLESRC","member":"ART300","extension":"SQLRPGLE"}

### 🤖 Assistant

> 🔧 called: read_member



> 🔧 **read_member** — {"extension":"RPGLE","file":"QRPGLESRC","library":"SAMSRC1","member":"ART300"}

### 🤖 Assistant

> 🔧 called: update_todo_list

This is a service program module (NOMAIN). Now I need to find and read the `/copy article` copybook, the `ARTICLE1` file (PF/LF), and understand all the fields referenced.

> 🔧 **update_todo_list** — 
[x] Read ART300 member from SAMSRC1/QRPGLESRC
[-] Find and read /copy or /include copybooks referenced in ART300 (ARTICLE copybook)
[ ] Identify display file (DSPF) referenced and read its DDS source from SAMSRC1/QDDSSRC
[ ] Find and read physical/logical file DDS sources from SAMSRC1/QDDSSRC (ARTICLE1)
[ ] Identify reference file (e.g. SAMREF) and read field definitions
[ ] Generate technical documentation and save to docs/ART300-documentation.md


### 🤖 Assistant

> 🔧 called: search_qsys



> 🔧 **search_qsys** — SAMSRC1

### 🤖 Assistant

> 🔧 called: read_member, read_member



> 🔧 **read_member** — {"extension":"RPGLEINC","file":"QPROTOSRC","library":"SAMSRC1","member":"ARTICLE"}

> 🔧 **read_member** — {"extension":"PF","file":"QDDSSRC","library":"SAMSRC1","member":"ARTICLE"}

### 🤖 Assistant

> 🔧 called: search_qsys, search_qsys

Now let me read the SAMREF reference file to understand field definitions, and also search for the ARTICLE1 logical file.

> 🔧 **search_qsys** — SAMSRC1

> 🔧 **search_qsys** — SAMSRC1

### 🤖 Assistant

> 🔧 called: read_member, read_member



> 🔧 **read_member** — {"extension":"PF","file":"QDDSSRC","library":"SAMSRC1","member":"SAMREF"}

> 🔧 **read_member** — {"extension":"LF","file":"QDDSSRC","library":"SAMSRC1","member":"ARTICLE1"}

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read ART300 member from SAMSRC1/QRPGLESRC
[x] Find and read /copy or /include copybooks referenced in ART300 (ARTICLE copybook)
[x] Identify display file (DSPF) referenced and read its DDS source from SAMSRC1/QDDSSRC (no DSPF - service module)
[x] Find and read physical/logical file DDS sources from SAMSRC1/QDDSSRC (ARTICLE PF, ARTICLE1 LF)
[x] Identify reference file (e.g. SAMREF) and read field definitions
[-] Generate technical documentation and save to docs/ART300-documentation.md


### 🤖 Assistant

> 🔧 called: search_qsys, search_qsys

Now I have all the information needed. Let me also check if there are any other members in QILESRVSRC or binding directories that reference ART300 (to understand how it's used as a service program):

> 🔧 **search_qsys** — SAMSRC1

> 🔧 **search_qsys** — SAMSRC1

### 🤖 Assistant

> 🔧 called: search_qsys



> 🔧 **search_qsys** — QBNDSRC

### 🤖 Assistant

> 🔧 called: read_member



> 🔧 **read_member** — {"extension":"BNDDIR","file":"QBNDSRC","library":"SAMSRC1","member":"SAMPLE"}

### 🤖 Assistant

> 🔧 called: write_file

I notice the binding directory references `FARTICLE *SRVPGM` — this confirms ART300 likely compiles to the `FARTICLE` service program. Now I have all the information needed. Let me generate the documentation:

> 🔧 **write_file** — docs/ART300-documentation.md

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read ART300 member from SAMSRC1/QRPGLESRC
[x] Find and read /copy or /include copybooks referenced in ART300 (ARTICLE copybook)
[x] Identify display file (DSPF) referenced and read its DDS source from SAMSRC1/QDDSSRC (no DSPF - service module)
[x] Find and read physical/logical file DDS sources from SAMSRC1/QDDSSRC (ARTICLE PF, ARTICLE1 LF)
[x] Identify reference file (e.g. SAMREF) and read field definitions
[x] Generate technical documentation and save to docs/ART300-documentation.md


### 🤖 Assistant

Documentation saved to [`docs/ART300-documentation.md`](docs/ART300-documentation.md).

Here's a summary of what was documented:

---

### What ART300 is

**ART300** is not an interactive display program — it is a pure **data-access service module** (`H NOMAIN`, no display file). It compiles into the `FARTICLE` service program and is shared across the SAMCO application via the `SAMPLE` binding directory.

---

### Key findings documented

1. **Lazy-open / key-cache pattern** — `ARTICLE1` is opened with `USROPN` and the internal `chainARTICLE1` procedure skips the CHAIN entirely when the requested `ARID` matches the already-loaded record. A Mermaid flowchart shows this logic.

2. **No panel/step state machine** — that pattern belongs to interactive programs. ART300 has none; the prompt in the task template was noted as not applicable.

3. **9 exported procedures** — `GetArtDesc`, `GetArtRefSalPrice`, `GetArtStockPrice`, `GetArtFam`, `GetArtStock`, `GetArtMinStock`, `GetArtVatCode`, `ExistArt`, and `IsArtDeleted` — all taking `ARID (6A)` as input.

4. **Soft-delete** — `ExistArt` returns `*ON` only when `ARDEL <> 'X'`; `IsArtDeleted` checks the flag directly.

5. **Audit fields** — `ARCREA` (date), `ARMOD` (timestamp), `ARMODID` (11A) are on the file; ART300 is read-only so it doesn't write them.

6. **Full field-to-SAMREF mapping** table for all 14 ARTICLE file fields.