# PowerShell script to register X-29 Firebase Automatic Backup in Windows Task Scheduler
$TaskName = "X-29 Firebase Automatic Backup"
$CodeDir = (Resolve-Path "$PSScriptRoot\..").Path
$Action = New-ScheduledTaskAction -Execute "C:\Program Files\nodejs\node.exe" -Argument "scripts/backup.js --automatic" -WorkingDirectory $CodeDir
$Triggers = @(
    (New-ScheduledTaskTrigger -Daily -At "09:00AM"),
    (New-ScheduledTaskTrigger -Daily -At "02:30PM"),
    (New-ScheduledTaskTrigger -Daily -At "04:05PM"),
    (New-ScheduledTaskTrigger -Daily -At "07:30PM"),
    (New-ScheduledTaskTrigger -Daily -At "11:00PM")
)
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Triggers -Settings $Settings -User $env:USERNAME -Force
Write-Host "Task '$TaskName' registered with 5 daily triggers (09:00 AM, 02:30 PM, 04:05 PM, 07:30 PM, 11:00 PM) successfully."
Write-Host "Working Directory: $CodeDir"
