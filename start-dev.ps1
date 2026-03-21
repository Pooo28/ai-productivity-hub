# start-dev.ps1
# This script starts the Next.js frontend and the Flask backend in separate windows.

Write-Host "Starting AI Productivity Hub Development Servers..." -ForegroundColor Cyan

# Start Flask backend in a new window
Write-Host "Launching Flask backend on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python api/index.py" -WindowStyle Normal

# Start Next.js frontend in a new window
Write-Host "Launching Next.js frontend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host "`nDone! Check the new windows for status." -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend Health: http://localhost:5000/api/health"
