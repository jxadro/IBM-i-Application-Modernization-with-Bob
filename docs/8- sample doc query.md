# I need to change my default terminal interpreter in IBM i to bash

---

**Status:** active  **Date:** 2026-10-01

---

### 👤 User

I need to change my default terminal interpreter in IBM i to bash

---

### 🤖 Assistant

> 🔧 called: search_ibm_i_docs_with_rag



> 🔧 **search_ibm_i_docs_with_rag** — change default shell interpreter to bash IBM i PASE terminal

### 🤖 Assistant

> 🔧 called: search_ibm_i_docs_with_rag



> 🔧 **search_ibm_i_docs_with_rag** — SET_PASE_SHELL_INFO set bash as default shell for user

### 🤖 Assistant

The cleanest way to change your default PASE shell to bash on IBM i is via the `QSYS2.SET_PASE_SHELL_INFO` SQL procedure. First, make sure bash is installed, then call the procedure.

---

**Step 1 — Verify bash is installed**

Run this in a PASE or SSH session:
```bash
ls /QOpenSys/pkgs/bin/bash
```
If it's missing, install it via `yum`:
```bash
/QOpenSys/pkgs/bin/yum install bash
```

---

**Step 2 — Set bash as your shell**

Use the SQL procedure. There are two options depending on your intent:

**For your current user profile only:**
```sql
CALL QSYS2.SET_PASE_SHELL_INFO('*CURRENT', '/QOpenSys/pkgs/bin/bash');
```

**For a specific user profile (requires `*SECADM` authority):**
```sql
CALL QSYS2.SET_PASE_SHELL_INFO('MYUSER', '/QOpenSys/pkgs/bin/bash');
```

**For all users who don't have an explicit shell set (system-wide default):**
```sql
CALL QSYS2.SET_PASE_SHELL_INFO('*DEFAULT', '/QOpenSys/pkgs/bin/bash');
```

---

**Step 3 — Verify the change**

```sql
SELECT USER_NAME, PASE_SHELL_PATH
  FROM QSYS2.USER_INFO
  WHERE USER_NAME = CURRENT_USER;
```

---

**Notes:**
- The standard bash path from the IBM i open-source (`yum`) packages is `/QOpenSys/pkgs/bin/bash`. The older Bourne shell at `/QOpenSys/usr/bin/bsh` is **not** bash — don't confuse them.
- This setting is used by OpenSSH, `QP2TERM`, and any PASE application that reads the `pw_shell` field from the user profile.
- To undo the change and revert to the system default, call the procedure with an empty string: `CALL QSYS2.SET_PASE_SHELL_INFO('*CURRENT', '');`