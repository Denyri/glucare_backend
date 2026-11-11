@echo off
title GluCare Backend & AI Services Launcher
color 0A
echo =================================================================
echo             GLUCARE BACKEND & AI SERVICES LAUNCHER
echo =================================================================
echo Membuka 2 layanan utama:
echo  1. AI Microservice    : http://localhost:8000  (FastAPI / Swagger)
echo  2. Backend Node.js    : http://localhost:5001  (Express / API)
echo =================================================================
echo.

set ROOT_DIR=%~dp0

:: 1. Launch AI Server (Port 8000)
start "GluCare AI Server (Port 8000)" cmd /k "cd /d "%ROOT_DIR%glucare_ai" && echo [AI ENGINE RUNNING...] && python ai_server.py"

:: 2. Launch Backend Express (Port 5001)
start "GluCare Backend API (Port 5001)" cmd /k "cd /d "%ROOT_DIR%backend" && echo [BACKEND API RUNNING...] && npm run dev"

echo.
echo Layanan Backend dan AI telah diluncurkan!
echo - Dokumentasi Swagger Backend : http://localhost:5001/api-docs
echo - Dokumentasi Swagger AI      : http://localhost:8000/docs
echo.
pause
