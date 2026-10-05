# List all source files in library SAMSRCn. For each, show the source file name and its typical content type (QRPGLESRC, QDDSSRC, QCLSRC, QSQLSRC, etc.).

---

**Status:** active  **Date:** 2026-09-29

---

### 👤 User

List all source files in library SAMSRCn. For each, show the source file name and its typical content type (QRPGLESRC, QDDSSRC, QCLSRC, QSQLSRC, etc.).

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — [x] Identify task requirements
[-] Query library SAMSRCn for source physical files
[ ] Present the source files and typical content types


### 🤖 Assistant

> 🔧 called: execute_sql_statement



> 🔧 **execute_sql_statement** — SELECT OBJNAME, OBJTYPE, OBJATTRIBUTE, OBJTEXT 
FROM TABLE(QSYS2.OBJECT_STATISTICS('SAMSRC%', '*FILE')) 
WHERE OBJATTRIBUTE = 'PF' OR OBJATTRIBUTE LIKE '%SRC%'

### 🤖 Assistant

> 🔧 called: execute_sql_statement



> 🔧 **execute_sql_statement** — SELECT SCHEMA_NAME, SYSTEM_SCHEMA_NAME 
FROM QSYS2.SYSSCHEMAS 
WHERE SCHEMA_NAME LIKE 'SAM%' OR SYSTEM_SCHEMA_NAME LIKE 'SAM%'

### 🤖 Assistant

> 🔧 called: execute_sql_statement



> 🔧 **execute_sql_statement** — SELECT OBJNAME, OBJTYPE, OBJATTRIBUTE, OBJTEXT 
FROM TABLE(QSYS2.OBJECT_STATISTICS('SAMSRC1', '*FILE'))

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — [x] Identify task requirements
[x] Query library SAMSRCn for source physical files
[x] Present the source files and typical content types


### 🤖 Assistant

The source physical files found in library `SAMSRC1` (matching pattern `SAMSRCn`) are listed below along with their typical content types:

| Source File | Description / Typical Content Type | Member Extensions / Language Constructs |
| :--- | :--- | :--- |
| `QBNDSRC` | Binding Directory Source | Entries for binding directories (`*BNDDIR`) |
| `QCBLSRC` | ILE COBOL / OPM COBOL Source | `.cbl`, `.cblle`, `.cobol` |
| `QCLSRC` | Control Language Source (OPM & ILE) | `.cl`, `.clp`, `.clle` |
| `QCMDSRC` | Command Definition Source | `.cmd` (Command definitions for `CRTCMD`) |
| `QCSRC` | C Source | `.c` |
| `QCPPSRC` | C++ Source | `.cpp` |
| `QDDSSRC` | Data Description Specifications Source | `.pf`, `.lf`, `.dspf`, `.prtf` (Tables, views, display files, printer files) |
| `QDTASRC` | Data Area & Data Queue Generation Source | Definitions / build scripts for data areas and queues |
| `QILESRC` | ILE Program Build Source | Modules / compile scripts for program generation |
| `QILESRVSRC` | ILE Service Program Build Source | Modules / compile definitions for service programs |
| `QMSGSRC` | Message Description Source | Message file build specifications |
| `QPNLSRC` | Panel Group & Menu Source | `.pnlgrp`, `.menu` (UIM help/panel groups and menus) |
| `QPROTOSRC` | RPG Prototypes and Copybooks / Includes | `.rpgleinc`, `.cop` (Copybooks, `/INCLUDE`, `/COPY`) |
| `QRPGLESRC` | ILE RPG Source | `.rpgle`, `.sqlrpgle` (Fixed and free-format ILE RPG) |
| `QRPGSRC` | OPM RPG Source | `.rpg`, `.rpg38`, `.rpg400` (Legacy RPG II / RPG III / RPG/400) |
| `QSQLCSRC` | Embedded SQL in C Source | `.sqlc` |
| `QSQLCPPSRC` | Embedded SQL in C++ Source | `.sqlcpp` |
| `QSQLSRC` | Db2 for i SQL DDL / DML / Scripts | `.sql` (Tables, views, stored procedures, UDFs, triggers, sequences) |
| `QSRVSRC` | Binder Language Source | `.bnd` (`STRPGMEXP` / `ENDPGMEXP` export lists for service programs) |
| `QTESTSRC` | RPGUnit Test Suites Source | `.rpgle`, `.sqlrpgle` (RPGUnit test case procedures) |
| `QTRGSRC` | SQL Trigger Source | `.sqltrg`, `.sql` (Trigger definitions and logic) |

---

### Proactive Next Steps
- Inspect members within any specific source file (e.g., [`/SAMSRC1/QRPGLESRC`](/SAMSRC1/QRPGLESRC) or [`/SAMSRC1/QDDSSRC`](/SAMSRC1/QDDSSRC)).
- Check for references, dependencies, or compile status of members in any of these source files.