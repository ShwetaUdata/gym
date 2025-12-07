#!/usr/bin/env powershell

# PowerFit Gym - Quick Start Script for Windows PowerShell

Write-Host "================================" -ForegroundColor Cyan
Write-Host "PowerFit Gym - Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$nodeCheck = node -v 2>$null
if ($null -eq $nodeCheck) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Node.js $nodeCheck found" -ForegroundColor Green

# Frontend setup
Write-Host ""
Write-Host "Setting up Frontend..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    npm install
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
}

# Backend setup
Write-Host ""
Write-Host "Setting up Backend..." -ForegroundColor Yellow
if (!(Test-Path "server\node_modules")) {
    Push-Location server
    npm install
    Pop-Location
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
}

# Check .env file
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path "server\.env")) {
    Write-Host "⚠ .env file not found in server/" -ForegroundColor Yellow
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "⚠ IMPORTANT: Edit server\.env with your Gmail credentials!" -ForegroundColor Yellow
    Write-Host "  1. Go to https://myaccount.google.com/apppasswords" -ForegroundColor Cyan
    2. Generate an App Password for Gmail" -ForegroundColor Cyan
    Write-Host "  3. Add to server\.env:" -ForegroundColor Cyan
    Write-Host "     EMAIL_USER=your-email@gmail.com" -ForegroundColor Cyan
    Write-Host "     EMAIL_PASSWORD=your-16-char-app-password" -ForegroundColor Cyan
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit server\.env with your Gmail credentials" -ForegroundColor White
Write-Host "2. Run this to start both servers:" -ForegroundColor White
Write-Host ""
Write-Host "   Open TWO PowerShell terminals:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Terminal 1 (Frontend):" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 2 (Backend):" -ForegroundColor Cyan
Write-Host "   cd server ; npm start" -ForegroundColor White
Write-Host ""
Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
