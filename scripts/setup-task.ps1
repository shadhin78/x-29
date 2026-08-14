# PowerShell script to register X-29 Firebase Automatic Backup in Windows Task Scheduler
$TaskName = "X-29 Firebase Automatic Backup"
$Action = New-ScheduledTaskAction -Execute "C:\Program Files\nodejs\node.exe" -Argument "scripts/backup.js --automatic" -WorkingDirectory "D:\X-29 Project\X-29\X-29-Code"
$Trigger = New-ScheduledTaskTrigger -Daily -At "05:10PM"
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -User $env:USERNAME -Force
Write-Host "Task '$TaskName' updated to 05:10 PM successfully."



