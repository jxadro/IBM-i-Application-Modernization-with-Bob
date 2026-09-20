# Project Architecture Rules (Non-Obvious Only)

## Binding / Activation Group Constraints
- All service programs use `ACTGRP(*CALLER)` — they run in the caller's activation group. Any new SRVPGM must follow this or resource ownership will break.
- `FVAT.SRVPGM` is the only service program with its own subdirectory (`functionsVAT/`) and build rules — all others bind from modules in QRPGLESRC.
- `PRO200.PGM` uses `ACTGRP(QILE)` (named group), not `*NEW` or `*CALLER` — changing this would break activation group resource scoping.

## Database Architecture
- `SAMCO/common/SAMREF.PF` is the **single source of truth** for all shared field definitions. Changes here cascade to every Physical File that uses `REF(SAMREF)`. It must be compiled before any PF.
- `TMPDETORD` (a duplicate of `DETORD` created in QTEMP) is the work table for in-progress order lines — it is ephemeral and must be pre-created by the CL wrapper before calling order-entry RPG programs.
- `LASTORDNO.DTAARA` (in QDTASRC) is the order number sequence counter — all order creation programs read/write this data area directly in the D-spec declaration.

## ILE Component Architecture
- Programs are built as **multi-module ILE programs** (`.ILEPGM`) or **service programs** (`.ILESRVPGM`): modules compile separately, then bind. Never compile a `.MODULE` target as a standalone program.
- Service program interface contracts are defined in `QPROTOSRC/*.RPGLEINC` — these are the API contracts. Changing exported procedure signatures breaks all callers without a recompile.
- The `SAMPLE.BNDDIR` binding directory is a named dependency in most `Rules.mk` entries — it aggregates service programs needed by the main application programs.

## Ordering Constraints for New Development
1. Add/modify field → update `SAMREF.PF` first, then recompile affected PFs.
2. Add procedure to service program → update prototype in `QPROTOSRC/<entity>.RPGLEINC`, then recompile module, rebind SRVPGM, recompile all caller programs.
3. Add new program with DB access → declare all file dependencies in `Rules.mk` before running `makei build`.
