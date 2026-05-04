@echo off
title NWHSTART
echo ========================================
echo    KIEM TRA DIA CHI IP CHO MOBILE
echo ========================================

:: Lay IP noi bo
for /f "tokens=4" %%a in ('route print ^| find " 0.0.0.0"') do (
    set IP=%%a
)

echo.
echo IP may tinh cua ban: %IP%
echo Link Web Admin      (Local)  : http://localhost:5173
echo Link Web Partner    (Local)  : http://localhost:5174
echo Link Web Khach Hang (Local)  : http://localhost:5175
echo Link Web Khach Hang (Network): http://%IP%:5175
echo.
echo ========================================
echo    DANG KHOI DONG CAC DICH VU...
echo ========================================

:: Backend API
start "backend-api" cmd /c "cd /d %~dp0backend-api && echo [backend-api] Starting... && npm run dev <nul & exit"

:: Web Admin
start "webadmin" cmd /c "cd /d %~dp0web\webadmin && echo [webadmin] Starting... && npm run dev <nul & exit"

:: Web Customer
start "webcustomer" cmd /c "cd /d %~dp0web\webcustomer && echo [webcustomer] Starting... && npm run dev <nul & exit"

:: Web Partner
start "webpartner" cmd /c "cd /d %~dp0web\webpartner && echo [webpartner] Starting... && npm run dev <nul & exit"

echo.
echo Dang doi server khoi dong de mo trinh duyet...
timeout /t 5 > nul
start chrome --user-data-dir="%temp%\nwh_admin" --incognito "http://localhost:5173"
start chrome --user-data-dir="%temp%\nwh_partner" --incognito "http://localhost:5174"
start chrome --user-data-dir="%temp%\nwh_customer" --incognito "http://%IP%:5175"

echo.
echo Da khoi dong 4 dich vu va mo 3 cua so Chrome doc lap!
echo [INFO] He thong dang chay. Hay chay file stop-all.bat de dung va dong cua so nay...

:: Tao chot khoa
echo running > "%temp%\nwh_running.lock"

:waitloop
timeout /t 2 > nul
if exist "%temp%\nwh_running.lock" goto waitloop

:: Khi stop-all.bat xoa chot khoa, tab nay se tu dong thoat
exit