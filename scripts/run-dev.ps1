$ErrorActionPreference = "Stop"

$root = "E:\Restaurant_Full_Stack_BD"

Write-Host ""
Write-Host "Starting Restaurant Backend..." -ForegroundColor Cyan

Start-Process powershell `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$root\backend'; npm run start:dev"
    )

Start-Sleep -Seconds 3

Write-Host "Starting Restaurant Frontend..." -ForegroundColor Cyan

Set-Location "$root\frontend"

npm run dev
