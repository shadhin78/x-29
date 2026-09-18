@echo off
setlocal
cd /d "%~dp0"
echo ==================================================
echo Starting X-29 Automatic Scheduled Backup...
echo Project: D:\X-29 Project\X-29-2\X-29-code
echo Target:  D:\X-29 Project\X-29-2\X-29-backup
echo ==================================================
echo.

node scripts\backup.js --automatic
set EXITCODE=%ERRORLEVEL%

echo.
echo ==================================================
echo Backup process completed with exit code: %EXITCODE%
echo ==================================================

exit /b %EXITCODE%
