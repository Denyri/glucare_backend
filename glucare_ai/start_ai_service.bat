@echo off
title GluCare AI Microservice (Port 8000)
color 0B
echo ===================================================
echo     MENJALANKAN GLUCARE AI MICROSERVICE (PORT 8000)
echo ===================================================
echo.
cd /d "%~dp0"
python ai_server.py
pause
