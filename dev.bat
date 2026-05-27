@echo off
chcp 65001 >nul 2>&1
echo.
echo  Starting DailyHot...
echo.

start /b "" cmd /c "cd /d %~dp0DailyHotApi && npm run dev > nul 2>&1"
timeout /t 3 /nobreak >nul
start /b "" cmd /c "cd /d %~dp0DailyHot && npm run dev"

echo.
echo  Frontend: http://localhost:6699
echo  Backend:  http://localhost:6688
echo.
echo  Press Ctrl+C to stop all services...
echo.

:wait
timeout /t 60 /nobreak >nul
goto wait
