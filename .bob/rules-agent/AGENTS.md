# Project Coding Rules (Non-Obvious Only)

## Build / Compile
- Single-file compile uses `makei c -f <basename>` (not a direct CL command) — `basename` is just the filename, not the full path.
- `INCDIR` must always include both `QPROTOSRC` and `includes` subdirectories; omitting either breaks `/copy` resolution for prototype and common CL includes.
- `.ILESRVPGM` files (QILESRVSRC) and `.ILEPGM` files (QILESRC) are raw CL source, not makefile targets — TOBi executes them directly during bind.
- `SAMCO/.ibmi.json` sets `tgtCcsid: "37"` project-wide; subdirectory `.ibmi.json` files can override this per component.

## RPG Patterns
- **Never declare `Dcl-S` for fields from externally described files** — they are brought in automatically by `Dcl-F ... Disk(*Ext)`.
- Indicator data structures (`indds(indds)` F-spec keyword) map function-key indicators to named boolean fields — always preserve the DS when converting fixed-to-free.
- `DTAARA` keyword on a D-spec variable (`DTAARA('LASTORDNO')`) binds it directly to a data area — do NOT convert this to an `IN`/`OUT` operation.
- When adding a new physical file that shares fields with existing entities, always define those fields via `REF(SAMREF)` + `REFFLD(fieldname)` rather than inline redefinition.
- Prototype `.RPGLEINC` files in `QPROTOSRC/` are fixed-form D-spec style — do not convert them to free-form without updating all callers.

## CL Patterns
- The `TMPDETORD` override pattern (`CRTDUPOBJ` → `OVRDBF TMPDETORD TOFILE(QTEMP/DETORD)`) is mandatory for order entry — it isolates work-in-progress detail lines to QTEMP.
- Shared CL logic lives in `SAMCO/includes/included.clle` and is pulled in with `INCLUDE SRCSTMF(...)`, not `/copy`.
- CL programs require `/*%%TEXT ...*/` and `/*%%OBJECT-TYPE *PGM*/` header comments for TOBi to resolve object type during build.

## Rules.mk Dependencies
- Every new `.PGM` or `.MODULE` target in a `Rules.mk` **must** explicitly list all file, SRVPGM, and BNDDIR dependencies — TOBi does not auto-discover them.
- To add a new service program dependency to a program, add it to both the `Rules.mk` dependency line AND the corresponding `.ILEPGM` `BNDSRVPGM()` parameter.
