@echo off
title X-29 Firestore Backup Verification (x-2k29)
cd /d "%~dp0"
echo ==================================================
echo Starting X-29 Firestore Backup Verification...
echo Source: ..\X-29-backup (D:\X-29 Project\X-29-2\X-29-backup)
echo ==================================================
echo.
node scripts\verify-backup.js %*
echo.
echo ==================================================
echo Process finished.
echo ==================================================
pause

