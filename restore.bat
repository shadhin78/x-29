@echo off
title X-29 Firestore Restore (x-2k29)
cd /d "%~dp0"
echo ==================================================
echo Starting X-29 Firestore Restore Utility...
echo Source: ..\X-29-backup (D:\X-29 Project\X-29\X-29-backup)
echo ==================================================
echo.
node scripts\restore.js %*
echo.
echo ==================================================
echo Process finished.
echo ==================================================
pause

