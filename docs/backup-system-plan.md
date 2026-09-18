# Configure Firestore Backup System for Separate Code & Backup Directories

This plan configures the Firestore Backup, Automatic Scheduled Backup, Deep Live Verification, and Restoration system so that:
- **`D:\X-29 Project\X-29\X-29-backup`** is exclusively used for all backup files, snapshots (Manual & Automatic), metadata, and execution logs (`backup-log.txt`, `verification-log.txt`, `restore-log.txt`).
- **`D:\X-29 Project\X-29\X-29-code`** remains strictly for application code only, with zero backups, snapshots, or runtime logs contaminating the codebase.

## User Review Required

> [!IMPORTANT]
> The scripts configure `BACKUP_BASE_DIR` to dynamically resolve to `path.join(X29_ROOT_DIR, 'X-29-backup')`, perfectly binding to `D:\X-29 Project\X-29\X-29-backup`.

## Proposed Changes

### Core Backup, Verification & Restore Scripts

#### [MODIFY] [scripts/backup.js](file:///d:/X-29%20Project/X-29/X-29-code/scripts/backup.js)
- Set `BACKUP_BASE_DIR` definition to `path.join(X29_ROOT_DIR, 'X-29-backup')`.
- Ensure header comments, log messages, and documentation references point to `X-29-backup`.
- Ensure logs directory continues to resolve to `path.join(BACKUP_BASE_DIR, 'logs')` inside `X-29-backup`.

#### [MODIFY] [scripts/verify-backup.js](file:///d:/X-29%20Project/X-29/X-29-code/scripts/verify-backup.js)
- Update `BACKUP_BASE_DIR` definition to `path.join(X29_ROOT_DIR, 'X-29-backup')`.
- Update relative path identifiers (`relSource` labels) to use `X-29-backup` (`X-29-backup\Manual`, `X-29-backup\Automatic`).
- Update CLI scanning output and diagnostic error messages.

#### [MODIFY] [scripts/restore.js](file:///d:/X-29%20Project/X-29/X-29-code/scripts/restore.js)
- Update `BACKUP_BASE_DIR` definition to `path.join(X29_ROOT_DIR, 'X-29-backup')`.
- Update relative path labels and completion banner outputs to reference `X-29-backup`.

---

### Automation & Batch Launchers

#### [MODIFY] [backup.bat](file:///d:/X-29%20Project/X-29/X-29-code/backup.bat)
- Update `Target:` banner text to display `D:\X-29 Project\X-29\X-29-backup`.

#### [MODIFY] [backup-auto.bat](file:///d:/X-29%20Project/X-29/X-29-code/backup-auto.bat)
- Update `Project:` banner text to display `D:\X-29 Project\X-29\X-29-code`.
- Update `Target:` banner text to display `D:\X-29 Project\X-29\X-29-backup`.

#### [MODIFY] [verify.bat](file:///d:/X-29%20Project/X-29/X-29-code/verify.bat)
- Update `Source:` banner text to display `D:\X-29 Project\X-29\X-29-backup`.

#### [MODIFY] [restore.bat](file:///d:/X-29%20Project/X-29/X-29-code/restore.bat)
- Update `Source:` banner text to display `D:\X-29 Project\X-29\X-29-backup`.

#### [MODIFY] [scripts/setup-task.ps1](file:///d:/X-29%20Project/X-29/X-29-code/scripts/setup-task.ps1)
- Update working directory to dynamically resolve `$PSScriptRoot\..` (which resolves to `D:\X-29 Project\X-29\X-29-code`).
- Update `$TaskName` to `"X-29 Automatic Backup"`.

---

### Git & Documentation Configuration

#### [MODIFY] [X-29-code/.gitignore](file:///d:/X-29%20Project/X-29/X-29-code/.gitignore)
- Ensure `X-29-backup/` and any log files are properly ignored.

#### [NEW] [.gitignore](file:///d:/X-29%20Project/X-29/.gitignore)
- Create a workspace root `.gitignore` ignoring `X-29-backup/`, `node_modules/`, and service account keys.

#### [MODIFY] [FIREBASE_BACKUP_GUIDE.md](file:///d:/X-29%20Project/X-29/X-29-code/FIREBASE_BACKUP_GUIDE.md)
- Update paths to reflect `D:\X-29 Project\X-29\X-29-backup` for backup storage and `D:\X-29 Project\X-29\X-29-code` for application code.

#### [MODIFY] [BACKUP_RESTORE_VERIFY_SYSTEM_REPORT.txt](file:///d:/X-29%20Project/X-29/BACKUP_RESTORE_VERIFY_SYSTEM_REPORT.txt)
- Update the system report to explicitly state the dual-folder architectural separation (`X-29-code` for code, `X-29-backup` for backups).

---

## Verification Plan

### Automated / CLI Verification
1. **Execute Test Backup with Automatic Live Verification**:
   - Run from `d:\X-29 Project\X-29\X-29-code`:
     ```powershell
     node scripts\backup.js --verify
     ```
   - Verify that:
     - `D:\X-29 Project\X-29\X-29-backup\Manual\<date>\<time>\firestore-backup.json` is created.
     - `metadata.json` is written with correct document count, collection count, and SHA-256 hash.
     - Level 1 local file verification succeeds.
     - Level 2 automatic live verification connects to Firestore (`x-2k29`), compares the canonical tree, and logs `EXACT MATCH`.
     - Logs are written exclusively to `D:\X-29 Project\X-29\X-29-backup\logs\backup-log.txt` and `verification-log.txt`.
     - Zero backup files or logs exist in `D:\X-29 Project\X-29\X-29-code`.

2. **Execute Standalone Verification**:
   - Run from `d:\X-29 Project\X-29\X-29-code`:
     ```powershell
     node scripts\verify-backup.js --latest
     ```
   - Verify that it discovers the backup from `X-29-backup`, completes live comparison, and logs `EXACT MATCH`.

3. **Restoration Discovery Dry-Run**:
   - Verify that `scripts/restore.js` correctly discovers the newly created snapshot in `X-29-backup` without running destructive steps.
