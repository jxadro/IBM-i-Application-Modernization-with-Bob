# Project Documentation Context (Non-Obvious Only)

## Counterintuitive Structure
- `SAMCO/QRPGSRC/` contains OPM (fixed-form, legacy) RPG — `QRPGLESRC/` contains ILE RPGLE. Mixed fixed-form and free-form programs coexist in QRPGLESRC.
- `SAMCO/functionsVAT/` and `SAMCO/globalization/` are **self-contained subprojects** with their own build rules, not just source folders.
- `SAMCO/QPROTOSRC/` is the canonical source for service program APIs — not the `.ILESRVPGM` binder source files in QILESRVSRC.
- `SAMCO/common/SAMREF.PF` is a reference-only DDS file (no records, no key) used solely as a field dictionary — querying it at runtime would return nothing.

## Documentation Locations
- **Architecture reference**: `SAMCO/SAMCO_Architecture_Documentation.md` — DB schema, field types, program relationships, Mermaid diagrams.
- **Interactive HTML portal** (Spanish): `docs/samco/` — entry at `docs/samco/flujo_samco.html`. Data files: `reglas_data.js`, `procesos_data.js`, `entidades_data.js`, `campos_data.js`.
- **Business rules** use ID format `BR-SAM-NNN`; **functional processes** use `PF-SAM-NNN`.
- `docs/ART200-documentation.md` and `docs/ART300_BusinessRules.md` contain detailed per-program documentation for the article module.

## IBM i Terminology to Use
- In QSYS context: *libraries*, *source files*, *members* (not folders/files).
- In IFS context (this workspace): *directories* and *stream files*.
- PF = Physical File (table), LF = Logical File (view/index), DSPF = Display File, PRTF = Printer File, SRVPGM = Service Program.
