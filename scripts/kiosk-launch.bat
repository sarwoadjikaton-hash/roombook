@echo off
REM ====================================================
REM ROOMBOOK DISPLAY TV KIOSK LAUNCHER
REM Membuka layar display ruangan dalam mode Fullscreen Kiosk di Google Chrome/Edge
REM ====================================================

set ROOM_SLUG=%1
if "%ROOM_SLUG%"=="" set ROOM_SLUG=ruang-sekjen

echo Membuka Display Kiosk untuk ruangan: %ROOM_SLUG%...
start msedge --kiosk "http://localhost:3000/display/%ROOM_SLUG%" --edge-kiosk-type=fullscreen --no-first-run
if %errorlevel% neq 0 (
  start chrome --kiosk "http://localhost:3000/display/%ROOM_SLUG%" --incognito --disable-pinch
)
