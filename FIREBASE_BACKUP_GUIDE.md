# X-29 (`x-2k29`) Local Firestore Backup, Restore & Verification Guide

This guide describes how to run, automate, and maintain your free, 100% local, automatic backup, restore, and deep verification system for the X-29 Firebase Cloud Firestore database on Windows.

---

## 1. What the System Does
This backup, restore, and verification system connects to Firebase Cloud Firestore using the **Firebase Admin SDK** locally on your Windows PC. It exports all root-level collections, documents, and nested subcollections into portable, timestamped JSON format without needing Firebase's paid export feature.

- **Automated Recursive Backup**: Discovers all Firestore collections and subcollections recursively.
- **Type Preservation**: Safely serializes and deserializes Firestore Timestamps, GeoPoints, DocumentReferences, and Binary Data (`Bytes`/`Buffer`).
- **Data Retention**: Retains the latest 30 backups automatically and purges older ones only after a new backup successfully verifies.
- **Safe & Full Restoration**: Offers non-destructive merge restore as well as full database restoration after accidental data loss.
- **Read-Only Deep Verification**: Performs recursive value-level comparisons between Live Firestore and backup snapshots, calculating canonical SHA-256 hashes without modifying any data.

---

## 2. Installing Node.js
If Node.js is not already installed on your computer:
1. Visit [https://nodejs.org/](https://nodejs.org/).
2. Download the latest **LTS (Long Term Support)** installer for Windows.
3. Run the installer and keep the default options selected.
4. Verify installation by opening PowerShell/Command Prompt and running:
   ```cmd
   node -v
   npm -v
   ```

---

## 3. Installing Dependencies
From your project code directory (`D:\X\X-29\X-29-Code`), install the required `firebase-admin` dependency by running:
```cmd
npm install
```
*(Note: `firebase-admin` is listed under `dependencies` in `package.json`.)*

---

## 4. Obtaining the Firebase Service Account Key
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`x-2k29`**.
3. Click the **Gear icon (Project Settings)** in the top left menu -> **Service Accounts**.
4. Click **Generate new private key**.
5. Confirm by clicking **Generate key**. A `.json` credential file will be downloaded to your computer.

---

## 5. Service Account Placement & Security
1. Move the downloaded JSON file to your project code folder:
   ```
   D:\X\X-29\X-29-Code\firebase-service-account.json
   ```
2. Rename the file exactly to: `firebase-service-account.json`.

> [!CAUTION]
> **CRITICAL SECURITY RULES:**
> - **NEVER** expose `firebase-service-account.json` to frontend JavaScript code.
> - **NEVER** place `firebase-service-account.json` inside the `public/` directory or static folders.
> - **NEVER** commit `firebase-service-account.json` or the `X-29-Backups/` directory to Git.
> - Both entries are strictly protected and blocked with a `403 Forbidden` error on `dev-server.js`.

---

## 6. How to Run Backup Manually

### Option A: Double-Click Batch File (Windows)
Double-click [`backup.bat`](file:///d:/X/X-29/X-29-Code/backup.bat) in the project code directory (`D:\X\X-29\X-29-Code`).

### Option B: Command Prompt / PowerShell
Open terminal in `D:\X\X-29\X-29-Code` and execute:
```cmd
node scripts\backup.js
```

---

## 7. How to Run Backup Verification (Read-Only)

### Option A: Double-Click Batch File (Windows)
Double-click [`verify.bat`](file:///d:/X/X-29/X-29-Code/verify.bat) in the project code directory (`D:\X\X-29\X-29-Code`).

### Option B: Command Prompt / PowerShell CLI Options
Open terminal in `D:\X\X-29\X-29-Code` and execute any of the following modes:

1. **Interactive Menu**:
   ```cmd
   node scripts\verify-backup.js
   ```
   Scans `D:\X\X-29\X-29-Backups` and displays a menu to pick a backup or `LATEST`.

2. **Verify Latest Backup**:
   ```cmd
   node scripts\verify-backup.js --latest
   ```

3. **Verify Specific Backup**:
   ```cmd
   node scripts\verify-backup.js --backup "2026-08-13_19-16-19"
   ```

4. **Audit All Backups Matrix**:
   ```cmd
   node scripts\verify-backup.js --all
   ```

---

## 8. How to Run Restore

### Option A: Double-Click Batch File (Windows)
Double-click [`restore.bat`](file:///d:/X/X-29/X-29-Code/restore.bat) in the project code directory (`D:\X\X-29\X-29-Code`).

### Option B: Command Prompt / PowerShell
Open terminal in `D:\X\X-29\X-29-Code` and execute:
```cmd
node scripts\restore.js
```

---

## 9. Difference Between SAFE RESTORE and FULL RESTORE

| Feature | SAFE RESTORE (Option 1) | FULL RESTORE (Option 2) |
| :--- | :--- | :--- |
| **Data Handling** | Merges backup documents into Firestore. | Wipes existing Firestore documents, then restores backup. |
| **Existing Data** | Keeps non-conflicting documents intact. | Permanently deletes current documents in Firestore. |
| **Safety Level** | Non-destructive (safe default). | Destructive (requires typing `RESTORE` confirmation). |
| **Use Case** | Recovering missing items or merging data. | Disaster recovery / reverting database to exact snapshot. |

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
