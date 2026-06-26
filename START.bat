@echo off
title LinkGuard - Expo Dev Server
color 0A
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"
cd /d "C:\Users\dell\LinkGuard"
echo.
echo  ============================================
echo   LinkGuard Mobile App - Dev Server
echo  ============================================
echo.
"C:\Program Files\nodejs\node.exe" --version
echo  Starting... QR code appears in 20-30 sec!
echo.
"C:\Program Files\nodejs\npx.cmd" expo start --clear
pause
