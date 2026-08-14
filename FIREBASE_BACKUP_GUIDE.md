# X-29 (`x-2k29`) Firestore Backup, Restore & Verification Guide

This guide describes how the automated, cloud-based GitHub Actions daily backup system works alongside your local manual backup, restore, and deep verification system for the X-29 Firebase Cloud Firestore database.

---

## 1. System Architecture: Manual vs Automatic Separation

The X-29 backup system strictly separates **local manual backups** and **cloud automatic GitHub Actions backups**:

```text
[MANUAL BACKUPS] (Local PC Execution)
Firebase Firestore → node scripts/backup.js → D:\X-29 Project\X-29\X-29-Backups\Manual\DD MM YYYY HH MM AM/

[AUTOMATIC BACKUPS] (Cloud GitHub Actions)
Firebase Firestore → GitHub Actions Runner → backups/Automatic/DD MM YYYY HH MM AM/ → Git Commit & Push
```

> [!IMPORTANT]
> **BACKUP-ONLY GUARANTEE**: Both manual and scheduled cloud workflows are strictly **READ-ONLY** with respect to Firestore. They will never modify, overwrite, delete, or restore Firestore data. Restoration is exclusively a separate manual process.

---

## 2. Backup Folder Structure & Timestamp Format

### Timestamp Naming Format
Folder names use 12-hour Bangladesh local time (`Asia/Dhaka` / UTC+6):

`DD MM YYYY HH MM AM` or `DD MM YYYY HH MM PM`

Examples:
- `14 08 2026 03 00 AM`
- `14 08 2026 10 32 AM`
- `14 08 2026 06 45 PM`

### Local / Manual Backups Location
Local PC manual backups created by running `node scripts/backup.js` are saved to:

`D:\X-29 Project\X-29\X-29-Backups\Manual\`

```text
X-29-Backups/
└── Manual/
    ├── 14 08 2026 10 32 AM/
    │   ├── firestore-backup.json
    │   └── metadata.json
    └── 14 08 2026 06 45 PM/
        ├── firestore-backup.json
        └── metadata.json
```

### Cloud / Automatic Backups Location
Automatic backups running daily through GitHub Actions are committed to Git under:

`backups/Automatic/`

```text
backups/
└── Automatic/
    ├── 14 08 2026 03 00 AM/
    │   ├── firestore-backup.json
    │   └── metadata.json
    └── 15 08 2026 03 00 AM/
        ├── firestore-backup.json
        └── metadata.json
```

---

## 3. GitHub Secrets Setup (`FIREBASE_SERVICE_ACCOUNT`)

To authenticate GitHub Actions with Firebase without exposing credentials:

1. Open your GitHub Repository on GitHub.com (`shadhin78/x-29`).
2. Navigate to **Settings** -> **Secrets and variables** -> **Actions**.
3. Click **New repository secret**.
4. Name: `FIREBASE_SERVICE_ACCOUNT`
5. Value: Copy and paste the complete text contents of your `firebase-service-account.json` file.
6. Click **Add secret**.

> [!CAUTION]
> - Never commit `firebase-service-account.json` to Git. It is listed in `.gitignore`.
> - Never print secrets in workflow step logs.

---

## 4. Schedule & Timezone Conversion

- **Workflow File**: [`.github/workflows/firebase-backup.yml`](file:///d:/X-29%20Project/X-29/X-29-Code/.github/workflows/firebase-backup.yml)
- **Current Test Schedule**: `30 5 * * *` (UTC)
- **Bangladesh Standard Time (BST, UTC+6)**: Configured for **11:30 AM BD Time** (05:30 UTC).
- **Production Schedule**: `0 21 * * *` (UTC) = **03:00 AM BD Time**.

---

## 5. How to Trigger Backups Manually

### Option A: Local PC CLI Execution
```cmd
node scripts\backup.js
```
*(Creates backup under `D:\X-29 Project\X-29\X-29-Backups\Manual\DD MM YYYY HH MM AM\` using local `firebase-service-account.json`.)*

### Option B: GitHub Actions UI
1. Open your GitHub repository on GitHub.com.
2. Click the **Actions** tab.
3. Select **Automatic Firebase Firestore Backup** from the left sidebar.
4. Click **Run workflow** -> Select branch `main` -> Click **Run workflow**.

---

## 6. Automated Verification & Failure Protection

Before any backup is saved or committed, `scripts/backup.js` performs strict verification:
1. Validates JSON syntax.
2. Confirms file existence and non-zero byte size.
3. **Zero-Document Protection**: If Firestore returns 0 documents, the process aborts immediately with error code `1` to prevent committing an empty database state.
4. Validates document and collection counts.
5. Calculates SHA-256 checksum and compares with `metadata.json`.

If verification fails, **the job stops immediately and NO git commit is created**.

---

## 7. Retention Policy (`KEEP_DAYS=30`)

- Configurable via `KEEP_DAYS` environment variable (default: `30` days).
- Dated folders older than 30 days are automatically pruned after a new backup successfully verifies.
- The latest successful backup directory is **always preserved**, regardless of age.
- If a backup fails, retention pruning is skipped completely.

---

## 8. How to Run Manual Restoration

Restoration is strictly manual and interactive:

1. Open terminal in project code folder.
2. Run:
   ```cmd
   node scripts\restore.js
   ```
3. `restore.js` discovers backups across:
   - `D:\X-29 Project\X-29\X-29-Backups\Manual\`
   - `D:\X-29 Project\X-29\X-29-Backups\Automatic\`
   - `backups/Automatic/`
   - Legacy backup folders
4. Select desired backup folder from the menu.
5. Select restoration mode:
   - **`[1] SAFE RESTORE`**: Merges backup documents into Firestore non-destructively.
   - **`[2] FULL RESTORE`**: Wipes existing Firestore documents then restores exact backup state (requires typing `RESTORE`).

---

## 9. Read-Only Deep Verification Tool

To compare Live Firestore database against any backup snapshot without modifying any data:

```cmd
node scripts\verify-backup.js --latest
```
or
```cmd
node scripts\verify-backup.js --backup "14 08 2026 10 32 AM"
```

---

## 10. Creating Automatic Daily Backups in Windows Task Scheduler

To set up automatic daily backups without user interaction:

1. Open **Task Scheduler** in Windows (Search `Task Scheduler` in the Start Menu).
2. In the right panel, click **Create Task...**.
3. **General Tab**:
   - Name: `X-29 Firestore Backup`
   - Select **Run whether user is logged on or not** (or *Run only when user is logged on* for simple setups).
4. **Triggers Tab**:
   - Click **New...**.
   - Begin the task: **On a schedule**.
   - Settings: Select **Daily**.
   - Recur every: **1 days**.
   - Start time: **2:00:00 AM**.
   - Click **OK**.
5. **Actions Tab**:
   - Click **New...**.
   - Action: **Start a program**.
   - Program/script: `D:\X\X-29\X-29-Code\backup.bat`
   - Start in (optional): `D:\X\X-29\X-29-Code\`
   - Click **OK**.
6. **Settings Tab**:
   - ✅ Check **Run task as soon as possible after a scheduled start is missed**. *(This ensures that if your PC was powered off at 2:00 AM, Windows automatically runs the backup as soon as you turn on your PC.)*
   - Click **OK** to save the task.

---

## 11. How to Restore After Accidental Firestore Deletion
If data is accidentally lost or deleted in Cloud Firestore:
1. Do **NOT** run a new backup if the current database is empty or corrupt.
2. Run [`verify.bat`](file:///d:/X/X-29/X-29-Code/verify.bat) or `node scripts\verify-backup.js --all` to inspect existing backup health.
3. Run [`restore.bat`](file:///d:/X/X-29/X-29-Code/restore.bat).
4. Select the newest healthy backup timestamp from the menu.
5. Select **`[1] SAFE RESTORE`** to merge missing documents back, or **`[2] FULL RESTORE`** (type `RESTORE`) to return Firestore to the exact state of that backup.
6. Launch X-29 web app to verify data hydration.

---

## 12. Security Warnings
- Local scripts run with full Admin privileges on Firestore.
- Keep `firebase-service-account.json` confidential.
- Ensure `dev-server.js` or any static web host never serves `.json` credential files or the `X-29-Backups/` folder over HTTP.

---

## 13. How to Test the System Safely
1. Run `backup.bat` once.
2. Check that a folder was created under `D:\X\X-29\X-29-Backups\YYYY-MM-DD_HH-mm-ss\firestore-backup.json`.
3. Open `firestore-backup.json` and verify document fields and metadata.
4. Run `verify.bat` or `node scripts\verify-backup.js --latest` to run a 100% read-only deep comparison.
5. Run `restore.bat`, pick the created backup, and select `[1] SAFE RESTORE`. Safe restore will write back document data non-destructively without wiping Firestore.

---

## 14. Offsite Cloud Backup (Google Drive / OneDrive)
To protect against PC hardware failure:
- Set up **Google Drive for Desktop** or **OneDrive** sync on your PC.
- Configure your cloud drive to sync or back up the `D:\X\X-29\X-29-Backups` directory to the cloud automatically.

---

## 🛠 File Reference Overview
| File | Description |
| :--- | :--- |
| [`scripts/backup.js`](file:///d:/X/X-29/X-29-Code/scripts/backup.js) | Core recursive Firestore backup & validation script. |
| [`scripts/restore.js`](file:///d:/X/X-29/X-29-Code/scripts/restore.js) | Core safe/full Firestore restore script. |
| [`scripts/verify-backup.js`](file:///d:/X/X-29/X-29-Code/scripts/verify-backup.js) | Read-only deep backup verification script with canonical hashing. |
| [`backup.bat`](file:///d:/X/X-29/X-29-Code/backup.bat) | 1-click Windows batch launcher for backups. |
| [`verify.bat`](file:///d:/X/X-29/X-29-Code/verify.bat) | 1-click Windows batch launcher for backup verification. |
| [`restore.bat`](file:///d:/X/X-29/X-29-Code/restore.bat) | 1-click Windows batch launcher for restoration. |
| [`.gitignore`](file:///d:/X/X-29/X-29-Code/.gitignore) | Configured to ignore service account credentials & backups. |
| [`js/dev-server.js`](file:///d:/X/X-29/X-29-Code/js/dev-server.js) | HTTP server with 403 Forbidden protection for credentials/backups. |
