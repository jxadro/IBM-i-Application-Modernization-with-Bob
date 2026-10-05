---
description: Generate technical documentation for an SQLRPGLE/RPGLE member
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
