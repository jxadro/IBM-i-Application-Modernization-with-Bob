# Lab 106: Generate RPGUnit Tests for SAMCO

## Overview
Use `generate_rpg_unit_test_stub` to scaffold test cases for exported procedures in the `ART300` service program module, fill in test logic, and run the tests with code coverage against `SAMCOn`.

**NOTE:** PPI includes workflows that automates the whole 'RPGUnit Test Plan Generation and Execution' process, described here in this lab. The goal of this document is to show how to generate unit tests with Bob, with a few iterations and adjustments. **In a real environment, use the appropriate Bob Workflow.** 

**Duration**: 20 minutes  
**Difficulty**: Intermediate  
**Mode**: ℹ️ IBM i Developer  
**Source**: QSYS  : `SAMSRCn`library , `QRPGLESRC` and `QTESTSRC` physical files  
**Build target**: `SAMCOn` ,  creating test suite in program sufixed with a `T`

---

## Prerequisites
- Bob IDE with **IBM Bob Premium Package for i** installed
- **Code for IBM i** extension connected to your IBM i system
- `SAMCOn` in your library list — RPGUnit library also required
- [Lab 101](lab101-premium-discover-samco.md) completed (business rules context)

### Install RPGUnit

1. **Install IBM i Testing Extension**
   - Open VS Code Extensions
   - Search for "IBM i Testing"
   - Click Install

2. **Install RPGUnit Component to IBM i**
   - Open Code for IBM i connection settings
   - Navigate to "Components" tab
   - Click "Add Component"
   - Select "RPGUnit"
   - Click Install

3. **Update Library List**

Update library list to: SAMCOn, SAMSRCn, RPGUNIT, QDEVTOOLS

![alt text](pics/image-rpgunitlist.png)


### Source Code Location
```
Workspace or IFS (Integrated File System) or QSYS (SAMSRC lib, QRPGSRC file)
```

### Test Code Location
```
IBM i Libraries (QSYS)
└── SAMSRCn/                                          ← App = Test library
    └── QTESTSRC/                                       ← Test source file
        └── TART300.RPGLE                                ← Test suite member
```

## Step 1: Identify Exported Procedures (3 minutes)

**Switch to ℹ️ IBM i Developer mode** in the Bob chat panel.

**Prompt:**
```
Read SAMCOn library QRPGLESRC/ART300 RPGLE source

Identify all exported procedures: name, parameters (type and usage), return type, and purpose. Summarize as a table.
```

**What to observe:**
- Bob reads the local workspace file
- The `rpg-procedures-functions` skill is auto-loaded
- Returns the full procedure inventory — key exported procedures: `GetArtDesc`, `GetArtRefSalPrice`, `GetArtStockPrice`, `GetArtFam`, `GetArtStock`, `ExistArt`, `IsArtDeleted`, etc.

---

## Part 1 : Generate RPGUnit Test Stubs, Execute first Test Suite (4 minutes)

**Prompt:**
```
Generate RPGUnit test stubs for GetArtDesc, GetArtRefSalPrice, and ExistArt from  Source member: QRPGLESRC/ART300.rpgle from the SAMSRCn library.
Focus on these procedures: GetArtDesc, GetArtRefSalPrice, GetArtStockPrice. 
SAMSRCn is in QSYS.

Use generate_rpg_unit_test_stub. Show the recommended storage location and generated stub code. 
```

**What to observe:**
- Bob calls `generate_rpg_unit_test_stub` — reads exported signatures from the local file
- Generates scaffold with correct includes, prototypes, and empty test procedures
- Bob suggest to  compile, or add assertion values for specific test data using skill `rpgunit-testing` , `run_rpg_unit_test_suite`. 
---

### Step : Fill In Test Logic (6 minutes)

**Prompt:**
```
Based on the SAMCO business rules :
- GetArtDesc returns ARDESC for a given ARID
- ExistArt returns *On if the article exists and is not soft-deleted (ARDEL ≠ 'X')
- GetArtRefSalPrice returns ARSALEPR for a given ARID

Fill in test assertions for each procedure — one positive test and one negative test per procedure. Use the existing sample data in SAMCOn.
```

**What to observe:**
- Bob fills in `AssertEquals` / `AssertNotEquals` assertions using actual field names from `SAMREF.PF`

---

![alt text](pics/image-rpgunit.png)

### Step : Run the Tests with Code Coverage (4 minutes)

**Prompt:**
```
Run the RPGUnit test suite QTESTSRC/TART300 with *LINE code coverage. Show test results, coverage percentage, and any failures with details.
```

**What to observe:**
- Bob uses `run_rpg_unit_test_suite` with `codeCoverage="*LINE"`
- Returns pass/fail per test procedure and line coverage percentage

**If tests fail:**
```
Explain the failure and identify the correct expected value from the ART300 implementation.
```

---

## Part 2: Run RPGUnit Test Plan creation and implementation Workflows

In the workflow list (local workspace scope) , select and run the appropriate workflows, using the information used in Step 2 to 5.

> **Create RPGUnit Test Plan:** Creates an RPGUnit test plan for IBM i code by identifying testing goals, gathering supporting code and documents, validating the environment, and generating test plan artifacts for later implementation.

> **Implement RPGUnit Test Plan:**  Implements an existing RPGUnit test plan by locating the generated planning artifacts, validating the IBM i test environment, and producing the RPGUnit test code and related outputs


---
## ✅ Success Criteria

- [ ] Exported procedures in `ART300-Function_Article.RPGLE` identified from local workspace
- [ ] Test stubs generated with `generate_rpg_unit_test_stub` and saved to `SAMCO/QTESTSRC/`
- [ ] Positive and negative test assertions filled in for `GetArtDesc`, `GetArtRefSalPrice`, `ExistArt`
- [ ] Test suite compiled in `SAMCOn`
- [ ] Tests run with `*LINE` code coverage — results interpreted

---

## Key Takeaways

- `generate_rpg_unit_test_stub` reads real procedure signatures — no type guessing
- Business rules documented in Lab 101 directly feed test assertions
- `*LINE` coverage identifies untested paths in service program logic
- Tests live in the Git repo (`SAMCO/QTESTSRC/`) — shareable across the team

---
