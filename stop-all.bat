@echo off
title NWH - Stop All Services
echo ========================================
echo    DANG DUNG TAT CA CAC DICH VU...
echo ========================================

:: Cuong che tat cac tien trinh node (Vite va Backend)
taskkill /F /IM node.exe /T >nul 2>&1

:: Tat cac cua so CMD co tieu de lien quan
taskkill /F /FI "WINDOWTITLE eq *backend-api*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *webadmin*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *webcustomer*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *webpartner*" /T >nul 2>&1
:: Xoa chot khoa de tab start-all tu dong thoat
if exist "%temp%\nwh_running.lock" del "%temp%\nwh_running.lock"

:: Chi dong cac cua so Chrome cua dự án NWH
taskkill /F /FI "WINDOWTITLE eq [NWH]*" /IM chrome.exe >nul 2>&1

echo.
echo Da dung tat ca cac dich vu thanh cong!
echo Cua so nay se tu dong dong sau 2 giay...
timeout /t 2 > nul
exit
