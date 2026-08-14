# X-29 (`x-2k29`) Firestore Local Backup, Restore & Verification Guide

This guide describes the local manual backup, restore, and deep verification system for the X-29 Firebase Cloud Firestore database.

---

## 1. System Architecture: Local Manual System

The X-29 backup system runs locally on your PC via Node.js scripts:

```text
Firebase Firestore → node scripts/backup.js → D:\X-29 Project\X-29\X-29-Backups\DD MM YYYY HH MM AM/PM
```

> [!IMPORTANT]
> **READ-ONLY BACKUP GUARANTEE**: Running `node scripts/backup.js` is strictly **READ-ONLY** with respect to Firestore. It will never modify, overwrite, delete, or restore Firestore data. Restoration is exclusively a separate manual process via `node scripts/restore.js`.

---

## 2. Backup Folder Structure & Naming Format

### Location
All local backups created by running `node scripts/backup.js` are stored directly under:

`D:\X-29 Project\X-29\X-29-Backups\`

### Timestamp Naming Format
Folder names use 12-hour Bangladesh local time (`Asia/Dhaka` / UTC+6):

`DD MM YYYY HH MM AM` or `DD MM YYYY HH MM PM`

Examples:
- `14 08 2026 11 06 AM`
- `14 08 2026 06 45 PM`

### Directory Layout
```text
X-29-Backups/
├── 14 08 2026 11 06 AM/
│   ├── firestore-backup.json
│   ├── firestore.json
│   └── metadata.json
└── 14 08 2026 06 45 PM/
    ├── firestore-backup.json
    ├── firestore.json
    └── metadata.json
```

---

## 3. Credentials Protection (`firebase-service-account.json`)

Local scripts authenticate with Firebase Admin SDK using `firebase-service-account.json` placed in the project root directory (`X-29-Code/firebase-service-account.json`).

> [!CAUTION]
> Never commit `firebase-service-account.json` to Git. It is protected by `.gitignore`.

---

## 4. How to Trigger Backups Manually

### Using Node.js directly:
```cmd
node scripts\backup.js
```

### Using 1-Click Batch File:
Double-click `backup.bat` in the `X-29-Code` directory.

---

## 5. Automated Verification & Failure Protection

Before completing a backup, `scripts/backup.js` performs strict verification:
1. Validates JSON syntax.
2. Confirms file existence and non-zero byte size.
3. **Zero-Document Protection**: If Firestore returns 0 documents, the process aborts immediately with error code `1` to prevent generating corrupted/empty backups.
4. Validates document and collection counts.
5. Calculates SHA-256 checksum and compares with `metadata.json`.

If verification fails, the generated backup file is deleted immediately and the process exits with an error.

---

## 6. Retention Policy (`KEEP_DAYS=30`)

- Configurable via `KEEP_DAYS` environment variable (default: `30` days).
- Dated backup folders older than 30 days are automatically pruned after a new backup successfully verifies.
- The latest successful backup directory is **always preserved**, regardless of age.

---

## 7. How to Run Manual Restoration

Restoration is strictly manual and interactive:

1. Open terminal in `X-29-Code`.
2. Run:
   ```cmd
   node scripts\restore.js
   ```
   (or double-click `restore.bat`)
3. Select the desired backup folder from the menu.
4. Select restoration mode:
   - **`[1] SAFE RESTORE`**: Merges backup documents into Firestore non-destructively.
   - **`[2] FULL RESTORE`**: Wipes existing Firestore documents then restores exact backup state (requires typing `RESTORE`).

---

## 8. Read-Only Deep Verification Tool

To compare Live Firestore database against any backup snapshot without modifying any data:

```cmd
node scripts\verify-backup.js --latest
```
or
```cmd
node scripts\verify-backup.js --backup "14 08 2026 11 06 AM"
```
(or double-click `verify.bat`)

---

## 9. Creating Automatic Daily Local Backups in Windows Task Scheduler

To set up automatic daily backups on your local PC:

1. Open **Task Scheduler** in Windows.
2. Click **Create Task...**.
3. **General Tab**: Name: `X-29 Local Firestore Backup`.
4. **Triggers Tab**: Add New Trigger -> **Daily** at desired time (e.g., `2:00 AM`).
5. **Actions Tab**: Add New Action -> Start a program:
   - Program/script: `D:\X-29 Project\X-29\X-29-Code\backup.bat`
   - Start in: `D:\X-29 Project\X-29\X-29-Code\`
6. **Settings Tab**: Check **Run task as soon as possible after a scheduled start is missed**.

---

## 🛠 File Reference Overview
| File | Description |
| :--- | :--- |
| [`scripts/backup.js`](file:///d:/X-29%20Project/X-29/X-29-Code/scripts/backup.js) | Core recursive Firestore backup & validation script. |
| [`scripts/restore.js`](file:///d:/X-29%20Project/X-29/X-29-Code/scripts/restore.js) | Core safe/full Firestore restore script. |
| [`scripts/verify-backup.js`](file:///d:/X-29%20Project/X-29/X-29-Code/scripts/verify-backup.js) | Read-only deep backup verification script. |
| [`backup.bat`](file:///d:/X-29%20Project/X-29/X-29-Code/backup.bat) | 1-click Windows batch launcher for backups. |
| [`verify.bat`](file:///d:/X-29%20Project/X-29/X-29-Code/verify.bat) | 1-click Windows batch launcher for backup verification. |
| [`restore.bat`](file:///d:/X-29%20Project/X-29/X-29-Code/restore.bat) | 1-click Windows batch launcher for restoration. |
| [`.gitignore`](file:///d:/X-29%20Project/X-29/X-29-Code/.gitignore) | Configured to ignore service account credentials. |
