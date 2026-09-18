#!/QOpenSys/pkgs/bin/bash
# =============================================================================
# Build with Tobi
# =============================================================================

export PATH=/QOpenSys/pkgs/bin:$PATH

/QOpenSys/pkgs/bin/yum install -y tobi
/QOpenSys/pkgs/bin/yum install -y python39
system "CRTLIB LIB(SAMCO) TEXT('SAMCO Application')"
cd ../SAMCO
export lib1=SAMCO
system "addlible SAMCO"
/QOpenSys/pkgs/bin/makei build
system "RUNSQLSTM SRCSTMF('../SAMCO/POPULATE_SAMCO_TABLES.sql') COMMIT(*NONE)"