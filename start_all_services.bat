@echo off
title GluCare Master Launcher
color 0A
echo =================================================================
echo             GLUCARE SYSTEM - MASTER LAUNCHER (3-TIER)
echo =================================================================
echo Membuka 3 layanan utama:
echo  1. AI Microservice    : http://localhost:8000
echo  2. Backend Node.js    : http://localhost:5001
echo  3. Frontend React Vite: http://localhost:5173
echo =================================================================
echo.

set ROOT_DIR=%~dp0

:: 1. Launch AI Server (Port 8000)
start "GluCare AI Server (Port 8000)" cmd /k "cd /d "%ROOT_DIR%main-feature\glucare_ai" && echo [AI ENGINE RUNNING...] && python ai_server.py"

:: 2. Launch Backend Express (Port 5001)
start "GluCare Backend API (Port 5001)" cmd /k "cd /d "%ROOT_DIR%main-feature\backend" && echo [BACKEND API RUNNING...] && npm run dev"

:: 3. Launch Frontend Vite (Port 5173)
start "GluCare Frontend App (Port 5173)" cmd /k "cd /d "%ROOT_DIR%main-feature\main-featureGlucare" && echo [FRONTEND APP RUNNING...] && npm run dev"

echo Semua 3 jendela terminal telah diluncurkan!
echo Anda dapat mengakses aplikasi di browser: http://localhost:5173
echo.
pause
