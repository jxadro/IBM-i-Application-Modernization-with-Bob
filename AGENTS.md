# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build System (Non-Standard)

- Build uses Tobi (`/QOpenSys/pkgs/bin/makei`) NOT gmake or standard make
- Build MUST set `export lib1=SAMCO` before running (`iproj.json` uses `&lib1` variable)
- Compile single file: `/QOpenSys/pkgs/bin/makei c -f QRPGLESRC/filename.PGM.SQLRPGLE`
- Full build: `/QOpenSys/pkgs/bin/makei build` (from `SAMCO/` directory)
- `Rules.mk` files define build dependencies — always check them before modifying source
- BNDDIR must be deleted before recreation (`SAMPLE.BNDDIR` line 4 explains why — `CRTBNDDIR` fails if it already exists)

## File Naming Conventions (Critical)

- Display files: `XXX###D-Description.DSPF` (e.g., `ART200D-Work_with_Article.DSPF`)
- Programs: `XXX###-Description.PGM.SQLRPGLE` (e.g., `ART200-Work_with_article.PGM.SQLRPGLE`)
- Modules (no `PGM`): `ART300-Function_Article.RPGLE` — absence of `.PGM.` = module, not program
- Prototypes: `NAME-Description.RPGLEINC` — `.RPGLEINC` avoids `*NONE` object type requirement
- OPM RPG lives in `QRPGSRC/` (legacy); ILE RPGLE lives in `QRPGLESRC/`

## CCSID Configuration (Per-Directory — Not Global)

- Root `SAMCO/.ibmi.json` sets `tgtCcsid: 37` but **subdirectories override this**:
  - `QRPGLESRC/`, `QSRVSRC/`, `QPROTOSRC/`: CCSID **297** (French)
  - `QCLSRC/`, `functionsVAT/`: CCSID **500** (EBCDIC International)
- Always check the subdirectory `.ibmi.json` before compiling — wrong CCSID causes silent data issues

## Code Patterns (Project-Specific)

- Panel-step pattern: Programs use `panel` (screen number) and `step##` (`prp`/`lod`/`dsp`/`key`/`chk`/`act`) — these are named constants defined at the top of each program
- Indicator data structures: All programs declare `indds` DS mapping indicator numbers to named fields (e.g., `exit 3 3n`, `sflclr 30 30n`) — never use raw `*IN##` in logic
- `/copy` uses bare names (`/copy familly`, `/copy article`) resolved via `iproj.json` `includePath: ["includes", "QPROTOSRC"]` — no path prefix, no extension
- Exception: When copy is outside `includePath`, use explicit path: `/copy qprotosrc/Xss`
- `SAMREF.PF` in `common/` is the central field-definition reference file — all physical files `REF(SAMREF)` for shared field definitions (types, lengths, edit codes)
- `REFFLD` in DDS references `SAMREF` records: e.g., `REFFLD(FCOUN/COID *LIBL/COUNTRY)`

## Service Program Architecture (Two Parallel Systems)

- `QSRVSRC/*.BND` + `QRPGLESRC/Rules.mk` → built by Tobi/makei (standard path)
- `QILESRVSRC/*.ILESRVPGM` → alternative CL-based build scripts (legacy/ARCAD-generated)
- Both systems coexist — `FARTICLE.SRVPGM` is in both; `Rules.mk` in `QILESRVSRC/` takes precedence for those service programs
- `SAMPLE.BNDDIR` aggregates all service programs — programs bind to `bnddir('SAMPLE')` not individual srvpgms

## SQL Conventions

- `TEXT` attribute in DDS becomes `LABEL ON` in SQL (documented in `QSQLSRC/readme.md`)
- SQLRPGLE programs check `SQLCODE` only (0=success, 100=not found) — never use SQLCA DS
- REST API service programs use `PGMINFO(*PCML : *MODULE : *DCLCASE)` for IWS integration
- SQL source types use distinct extensions: `.SQLPRC` (stored procedure), `.VIEW` (view), `.SQLUDF` (UDF), `.SQLSEQ` (sequence), `.SQLTRG` (trigger), `.TABLE` (table DDL)

## Build Object Library

- Code resides in `SAMCO/` directory, synchronized with IFS — always prefer local source
- Build objects default to `SAMCOx` libraries (user-specified suffix) — never use `SAMCO` library as target unless confirmed by user
- Only fall back to IBM i connection for source not present locally

## Dependencies (Hidden)

- `SAMPLE.BNDDIR` in `QBNDSRC/Rules.mk` depends on: XML, TXT, FARTICLE, FCUSTOMER, FFAMILLY, FPARAMETER, FPROVIDER, LOG, FCOUNTRY, ORDER, XSS — build these srvpgms before programs
- `QPROTOSRC/` prototypes are shared across many programs — changes here cascade broadly
- `functionsVAT/` is a self-contained subdirectory (own `.ibmi.json`, `Rules.mk`) that builds `FVAT.SRVPGM` — not listed in `QSRVSRC/Rules.mk`
- `CUS200.PGM` depends on `CUSSEQ.DTAARA` (a SQL sequence object built from `QSQLSRC/`)

---

## Application Overview — SAMCO

SAMCO is a multi-module IBM i business management application. It handles the full commercial cycle: orders, articles/products, customers, suppliers, and master data. The architecture follows ILE 3-tier conventions (presentation DSPF → business logic PGM → service programs SRVPGM → Db2 PF/LF/SQL).

**Scale:** 40+ programs, 9 physical files (PF), 6+ logical files (LF), 8 service programs, 27 business rules, 27 functional processes, 70+ documented fields.

### Application Modules

| Module prefix | Functional area | Key programs | Service program |
|---|---|---|---|
| `ORD` | Sales orders | ORD100, ORD101, ORD200, ORD201, ORD202, ORD500, ORD700, ORD900/901 | ORDER.SRVPGM |
| `ART` | Articles / catalogue | ART200, ART201, ART202, ART301, ART302, ART400, ART801 | FARTICLE.SRVPGM |
| `CUS` | Customers | CUS200, CUS300, CUS301 | FCUSTOMER.SRVPGM |
| `PRO` | Providers / suppliers | PRO200, PRO202, PRO203, PRO300 | FPROVIDER.SRVPGM |
| `FAM` | Article families (master data) | FAM300, FAM301 | FFAMILLY.SRVPGM |
| `COU` | Countries (master data) | COU300, COU301 | FCOUNTRY.SRVPGM |
| `PAR` | System parameters | PAR200, PAR201, PAR300 | FPARAMETER.SRVPGM |
| `LOG` | Application log | LOG100, LOG300 | LOG.SRVPGM |
| `DAT` | Date utilities | DAT001, DAT002 | — |
| `XML/TXT` | XML/text IFS utilities | XML001, TXT001 | XML.SRVPGM, TXT.SRVPGM |
| `VAT` | VAT calculation | (functionsVAT/) | FVAT.SRVPGM |

### Display Files (DSPF) — Presentation Layer

| File | Program(s) | Purpose |
|---|---|---|
| `ART200D` | ART200 | Work with Articles (subfile list) |
| `ORD100D` | ORD100/101 | Order entry / header |
| `ORD200D` | ORD200 | Order list / selection |
| `CUS200D` | CUS200 | Customer list |
| `PRO200D` | PRO200 | Provider list |
| `FAM301D` | FAM300/301 | Family maintenance |
| `COU200D/301D` | COU300/301 | Country maintenance |
| `PAR200D` | PAR200 | Parameter maintenance |
| `ORD500O` | ORD500 | Printer file (order confirmation / delivery note) |

---

## Data Model — Physical Files and Key Relationships

All PFs use `REF(SAMREF)` for shared field definitions. Logical files add keyed access paths for subfile browsing.

### Core Entities

#### ARTICLE (PF — `QDDSSRC/ARTICLE-Article_File.PF`)
Central product catalogue. Used by 8+ programs.

| Field | Type | Description |
|---|---|---|
| `ARID` | CHAR 6 | **PK** — Unique article code |
| `ARDESC` | CHAR 50 | Article description |
| `ARSALEPR` | PACKED 7,2 | Selling price (must be > 0) |
| `ARWHSPR` | PACKED 7,2 | Warehouse/stock price (must be > 0) |
| `ARTIFA` | CHAR 3 | **FK → FAMILLY.FAID** — Article family |
| `ARSTOCK` | PACKED 5,0 | Current stock quantity |
| `ARMINQTY` | PACKED 5,0 | Minimum stock threshold (reorder level) |
| `ARCUSQTY` | PACKED 5,0 | Quantity in open customer orders |
| `ARPURQTY` | PACKED 5,0 | Quantity in open purchase orders |
| `ARVATCD` | CHAR 1 | **FK → VATDEF** — VAT code (default `'2'`) |
| `ARCREA` | DATE | Creation date |
| `ARMOD` | TIMESTAMP | Last modification timestamp |
| `ARMODID` | CHAR 11 | Last modifying user |
| `ARDEL` | CHAR 1 | Logical delete flag: `' '`=active, `'X'`=deleted |

Logical files: `ARTICLE1` (keyed by ARDESC), `ARTICLE2` (keyed by ARTIFA).

#### CUSTOMER (PF — `QDDSSRC/CUSTOMER.PF`)
Customer master. Used by 6+ programs.

| Field | Type | Description |
|---|---|---|
| `CUID` | PACKED 5,0 | **PK** — Auto-generated by SQL sequence `CUSSEQ` |
| `CUSTNM` | CHAR 30 | Customer name / company |
| `CUPHONE` | CHAR 15 | Phone number |
| `CUVAT` | CHAR 12 | Tax ID / VAT number |
| `CUMAIL` | CHAR 50 | Email address |
| `CULINE1/2/3` | CHAR 50 | Postal address lines |
| `CUZIP` | CHAR 10 | Postal code |
| `CUCITY` | CHAR 30 | City |
| `CUCOUN` | CHAR 2 | **FK → COUNTRY.COID** — ISO-2 country code |
| `CULIMCRE` | PACKED 9,2 | Credit limit |
| `CUCREDIT` | PACKED 9,2 | Credit used (available = CULIMCRE – CUCREDIT) |
| `CULASTORD` | PACKED 8,0 | Last order date YYYYMMDD — updated by trigger ORD701 |
| `CUDEL` | CHAR 1 | Logical delete: `' '`=active, `'X'`=deleted |

Logical files: `CUSTOME1` (keyed by CUSTNM), `CUSTOME2`.

#### ORDER (PF — `QDDSSRC/ORDER.PF`)
Sales order header. Used by 9+ programs.

| Field | Type | Description |
|---|---|---|
| `ORID` | PACKED 6,0 | **PK** — Sequential order number via data area `LASTORDNO` |
| `ORYEAR` | PACKED 4,0 | Order year (fiscal year segregation) |
| `ORCUID` | PACKED 5,0 | **FK → CUSTOMER.CUID** |
| `ORDATE` | PACKED 8,0 | Order date YYYYMMDD |
| `ORDATDEL` | PACKED 8,0 | Expected delivery date |
| `ORDATCLO` | PACKED 8,0 | Close/processing date |

Logical files: `ORDER1` (keyed by ORCUID+ORID), `ORDER2` (keyed by ORDATE), `ORDER3`.
SQL view: `ORDERCUS` (JOIN ORDER + CUSTOMER — used for consolidated reports).
SQL trigger: `ORD701` (AFTER INSERT ON ORDER → updates CUSTOMER.CULASTORD).

#### DETORD (PF — `QDDSSRC/DETORD.PF`)
Order lines / detail. Composite PK. Used by 5+ programs.

| Field | Type | Description |
|---|---|---|
| `ODORID` | PACKED 6,0 | **PK** (part 1) **FK → ORDER.ORID** |
| `ODYEAR` | PACKED 4,0 | **PK** (part 2) — Order year |
| `ODLINE` | PACKED 5,0 | **PK** (part 3) — Line number within order |
| `ODARID` | CHAR 6 | **FK → ARTICLE.ARID** — Article on this line |
| `ODQTY` | PACKED 5,0 | Ordered quantity (> 0) |
| `ODQTYLIV` | PACKED 5,0 | Delivered/shipped quantity |
| `ODPRICE` | PACKED 7,2 | Unit price at time of order |
| `ODTOT` | PACKED 9,2 | Line total = ODQTY × ODPRICE |
| `ODTOTVAT` | PACKED 9,2 | Line total including VAT |

Logical file: `DETORD1`.

#### FAMILLY (PF — `QDDSSRC/FAMILLY.PF`)
Article families / categories. DDS declares `UNIQUE` on FAID.

| Field | Type | Description |
|---|---|---|
| `FAID` | CHAR 3 | **PK** — 3-char family code |
| `FADESC` | CHAR 50 | Family description |
| `FAVATCD` | CHAR 1 | **FK → VATDEF** — Default VAT code for articles |
| `FADEL` | CHAR 1 | Logical delete: `' '`=active, `'X'`=deleted |

Logical file: `FAMILL1`.

#### COUNTRY (PF — `QDDSSRC/COUNTRY.PF`)
Country reference table. ISO-3166 compliant.

| Field | Type | Description |
|---|---|---|
| `COID` | CHAR 2 | **PK** — ISO-3166 alpha-2 code (e.g. `'FR'`, `'ES'`) |
| `COUNTR` | CHAR 30 | Country name |
| `COISO` | CHAR 3 | ISO alpha-3 code |
| `COISO5` | CHAR 3 | ISO alpha-5 variant |
| `COISO1` | CHAR 3 | ISO numeric variant |

Logical file: `COUNTR1`. Referenced by CUSTOMER (`CUCOUN`) and PROVIDER (`PRCOUN`).

#### PROVIDER (PF — `QDDSSRC/PROVIDER.PF`)
Supplier master. Used by 4+ programs.

| Field | Type | Description |
|---|---|---|
| `PRID` | PACKED 5,0 | **PK** — Unique supplier number |
| `PROVNM` | CHAR 30 | Supplier name |
| `PRCONT` | CHAR 30 | Contact person |
| `PRPHONE` | CHAR 15 | Phone number |
| `PRCOUN` | CHAR 2 | **FK → COUNTRY.COID** |
| `PRDEL` | CHAR 1 | Logical delete: `' '`=active, `'X'`=deleted |

Logical file: `PROVIDE1`.

#### ARTIPROV (PF — `QDDSSRC/ARTIPROV.PF`)
M:N junction between ARTICLE and PROVIDER. Composite PK.

| Field | Type | Description |
|---|---|---|
| `APIART` | CHAR 6 | **PK** (part 1) **FK → ARTICLE.ARID** |
| `APIPRO` | PACKED 5,0 | **PK** (part 2) **FK → PROVIDER.PRID** |
| `APIPRI` | PACKED 7,2 | Supplier-specific purchase price (> 0) |

Logical file: `ARTIPRO1`.

#### PARAMETER (PF — `QDDSSRC/PARAMETER.PF`)
Application configuration (key-value store).

| Field | Type | Description |
|---|---|---|
| `PARKEY` | CHAR 20 | **PK** — Parameter key |
| `PARVAL` | CHAR 100 | Parameter value |
| `PARDES` | CHAR 100 | Parameter description / usage notes |

#### SQL / DDL Objects

| Object | Type | Description |
|---|---|---|
| `CUSSEQ` | SQLSEQ (`QSQLSRC/`) | Auto-increment sequence for CUSTOMER.CUID |
| `ORDERCUS` | VIEW (`QSQLSRC/`) | JOIN ORDER + CUSTOMER for consolidated reporting |
| `ARTIINF` | TABLE DDL (`QSQLSRC/`) | Supplementary article info (extends ARTICLE DDS) |
| `ISOTODATE` | SQLUDF (`QSQLSRC/`) | Convert ISO string to DATE |
| `ISOTODATE4` | SQLUDF (`QSQLSRC/`) | Convert ISO string to 4-digit year DATE |
| `ORD701` | SQLTRG (`QSQLSRC/`) | AFTER INSERT ON ORDER → UPDATE CUSTOMER.CULASTORD |
| `ART801` | SQLPRC (`QSQLSRC/`) | Batch stored procedure for article processing |

---

## Entity Relationship Summary

```
COUNTRY ──< CUSTOMER ──< ORDER ──< DETORD >── ARTICLE >── FAMILLY
               │                                  │
               │                             ARTIPROV
               │                                  │
COUNTRY ──< PROVIDER ────────────────────────────┘
```

Key cardinalities:
- `COUNTRY` 1:N `CUSTOMER` (via CUCOUN → COID)
- `COUNTRY` 1:N `PROVIDER` (via PRCOUN → COID)
- `CUSTOMER` 1:N `ORDER` (via ORCUID → CUID)
- `ORDER` 1:N `DETORD` (via ODORID → ORID)
- `ARTICLE` 1:N `DETORD` (via ODARID → ARID)
- `FAMILLY` 1:N `ARTICLE` (via ARTIFA → FAID)
- `ARTICLE` M:N `PROVIDER` via `ARTIPROV` (APIART/APIPRO composite PK)

---

## Service Program API Summary

### FARTICLE (modules: ART300, ART301, ART302)
Key exported functions consumed by orders and other modules:
- `ExistArt(ARID)` — returns `*ON` if article exists
- `IsArtDeleted(ARID)` — returns `*ON` if `ARDEL='X'`
- `GetArtDesc(ARID)` — returns ARDESC
- `GetArtStock(ARID)` — returns ARSTOCK
- `GetArtSalePr(ARID)` — returns ARSALEPR
- `GetArtFam(ARID)` — returns ARTIFA (family code)
- `GetArtVatCode(ARID)` — returns ARVATCD (VAT code)
- `SltArticle()` — interactive article selection screen (used as field help from orders)

### FCUSTOMER (module: CUS300)
Key exported functions:
- `ExistCus(CUID)` — existence check (called by ORD100/ORD101 before creating an order)
- `IsCusDeleted(CUID)` — returns `*ON` if `CUDEL='X'`
- `GetCusName(CUID)` — returns CUSTNM
- `GetCusCountry(CUID)` — returns CUCOUN
- `SltCustomer()` — interactive customer selection screen

### FFAMILLY (module: FAM300)
Key exported functions:
- `ExistFam(FAID)` — existence check
- `GetVATRate(VATCODE)` — returns VAT rate for a given code
- `CLCVat(VATCODE, NetValue)` — calculates VAT amount (used by ORD202 for line VAT)
- `ExistVATRate(VATCODE)` — validates VAT code exists in VATDEF

### FCOUNTRY (module: COU300)
- `ExistCountry(COID)` — validates country code

### FPROVIDER (module: PRO300)
- `ExistPro(PRID)` — existence check
- `IsProDeleted(PRID)` — returns `*ON` if `PRDEL='X'`

### LOG (module: LOG300)
- `AddLogEntry(entry)` — writes to `SAMLOG` user space (*USRSPC): format `'User: '+user+' * Date: '+timestamp+' * Msg: '+entry` (up to 500 chars). Uses IBM i API `RTVUSRSPCPTR` on `'SAMLOG *LIBL'`.

### FVAT (module: `functionsVAT/`)
- `CLCVat(VATCODE, NetValue)` — VAT calculation called by ORD202 for each order line

---

## Key Business Rules (Quick Reference)

| ID | Module | Rule | Status |
|---|---|---|---|
| BR-ORD-001 | ORD | Customer must exist before order creation (`ExistCus`) | CONFIRMED |
| BR-ORD-002 | ORD | Only active articles (`ARDEL ≠ 'X'`) can be added to order lines | CONFIRMED |
| BR-ORD-003 | ORD | Order number sequential via data area `LASTORDNO` | CONFIRMED |
| BR-ORD-004 | ORD | VAT calculated using the article's family VAT code (`CLCVat`) | CONFIRMED |
| BR-ORD-005 | ORD | Order total = sum of all DETORD lines (`ORDTOT`, `ORDVAT`) | CONFIRMED |
| BR-ORD-006 | ORD | Trigger ORD701 auto-updates `CULASTORD` on INSERT to ORDER | CONFIRMED |
| BR-ART-001 | ART | Article code (ARID) is unique, 6 chars | CONFIRMED |
| BR-ART-002 | ART | `ARSALEPR` and `ARWHSPR` must be > 0 | CONFIRMED |
| BR-ART-003 | ART | `ARMINQTY` should not exceed `ARSTOCK` | UNCONFIRMED |
| BR-ART-004 | ART | Article family (`ARTIFA`) must exist in FAMILLY | CONFIRMED |
| BR-ART-005 | ART | Article VAT code (`ARVATCD`) must reference valid VATDEF entry | CONFIRMED |
| BR-ART-006 | ART | Logical delete via `ARDEL='X'` — no physical deletions | CONFIRMED |
| BR-CUS-001 | CUS | Customer number auto-generated by SQL sequence `CUSSEQ` | CONFIRMED |
| BR-CUS-002 | CUS | Customer country (`CUCOUN`) must exist in COUNTRY | CONFIRMED |
| BR-CUS-003 | CUS | Available credit = `CULIMCRE` – `CUCREDIT` | CONFIRMED |
| BR-CUS-004 | CUS | Logical delete via `CUDEL='X'` — no physical deletions | CONFIRMED |
| BR-CUS-005 | CUS | `CULASTORD` updated automatically by trigger ORD701 | CONFIRMED |
| BR-PRO-001 | PRO | Supplier number (PRID) is unique, 5-digit packed | CONFIRMED |
| BR-PRO-002 | PRO | Supplier price (`APIPRI`) is independent of article selling price | CONFIRMED |
| BR-PRO-003 | PRO | Logical delete via `PRDEL='X'` | CONFIRMED |
| BR-MAE-001 | MAE | Family code (FAID) 3 chars, unique (DDS UNIQUE) | CONFIRMED |
| BR-MAE-002 | MAE | Family default VAT code (`FAVATCD`) references VATDEF | CONFIRMED |
| BR-MAE-003 | MAE | Country code (COID) 2 chars per ISO-3166 | CONFIRMED |
| BR-MAE-004 | MAE | Family logical delete via `FADEL='X'` | CONFIRMED |
| BR-UTL-001 | UTL | Log entry max 500 chars, includes user + timestamp | CONFIRMED |
| BR-UTL-002 | UTL | Log stored in `SAMLOG` user space (`*USRSPC`) via `RTVUSRSPCPTR` | CONFIRMED |
| BR-UTL-003 | UTL | Print (ORD500) requires complete ORDER + DETORD data | UNCONFIRMED |

> **CONFIRMED** = evidenced directly in source code. **UNCONFIRMED** = inferred from design, not yet verified in code.

---

## Logical Delete Pattern (Universal)

All master entities use logical (soft) delete — **never physical delete**. The flag is always `CHAR 1`, value `'X'` = deleted, `' '` = active:

| Entity | Delete field | Checked by |
|---|---|---|
| ARTICLE | `ARDEL` | `IsArtDeleted()` in FARTICLE |
| CUSTOMER | `CUDEL` | `IsCusDeleted()` in FCUSTOMER |
| PROVIDER | `PRDEL` | `IsProDeleted()` in FPROVIDER |
| FAMILLY | `FADEL` | Checked in FAM300/FAM301 |

---

## Program Numbering Convention

Within each module, numbers signal the program tier:

| Range | Role | Examples |
|---|---|---|
| `X00` | Interactive list / subfile | ART200, CUS200, ORD200, PRO200 |
| `X01` | Interactive maintenance (header/detail) | ORD101, ORD201 |
| `X02` | Interactive maintenance (full form / lines) | ART202, ORD202, PRO202 |
| `X03` | Interactive maintenance (alternate / sub-form) | PRO203 |
| `X00C` / `X00C2` | CL driver for interactive program | ORD100C, ORD500C |
| `X300` | Service program module (no display) | ART300, CUS300, COU300 |
| `X301` / `X302` | Secondary service modules | ART301, ART302, CUS301 |
| `X400` | Report / batch print | ART400 |
| `X500` | Print / spool program | ORD500 |
| `X700` | Batch processing | ORD700 |
| `X701` | SQL trigger | ORD701 |
| `X800/801` | SQL stored procedure / heavy batch | ART801 |
| `X900/901` | Miscellaneous / utility programs | ORD900, ORD901 |

---

## Cross-Module Call Graph (Critical Dependencies)

When modifying any of these, assess the full call chain:

- **ORD202** calls: `ExistArt`, `IsArtDeleted`, `GetArtVatCode` (FARTICLE) + `CLCVat` (FVAT)
- **ORD100/101** calls: `ExistCus`, `IsCusDeleted` (FCUSTOMER)
- **ORD700** calls: ARTICLE (stock update) + DETORD (mark delivered)
- **ART202** calls: `ExistFam` (FFAMILLY) + `ExistVATRate` (FFAMILLY/FVAT)
- **CUS301** calls: `ExistCountry` (FCOUNTRY) + reads CUSSEQ sequence
- **PRO202/203** calls: `ExistCountry` (FCOUNTRY)
- **FAM301** calls: `ExistVATRate` (FVAT)
- **LOG300** is called by any program needing audit logging via `AddLogEntry()`
- **ORD701 (trigger)** fires automatically on every INSERT to ORDER — no program call needed
