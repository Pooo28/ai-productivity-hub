# deploy.ps1
# This script commits all changes and pushes to GitHub to trigger Vercel deployment.

Write-Host "Staging all changes..." -ForegroundColor Yellow
git add .

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Deploy: Fix backend 404 and optimize routing ($timestamp)"

Write-Host "Committing changes: $commitMessage" -ForegroundColor Green
git commit -m $commitMessage

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "`nDeployment triggered! Check Vercel dashboard for status." -ForegroundColor Yellow
