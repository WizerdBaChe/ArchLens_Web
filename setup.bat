@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════╗
echo  ║   ArchLens Web — 初始化安裝腳本      ║
echo  ╚══════════════════════════════════════╝
echo.

:: ── 確認 Node.js 已安裝 ──
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] 找不到 Node.js
    echo.
    echo  請先安裝 Node.js v18 以上版本：
    echo  https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER%


where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] 找不到 npm
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
echo  [OK] npm v%NPM_VER%
echo.


echo  [1/1] 安裝依賴套件（npm install）...
echo.
npm install

if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] npm install 失敗，請檢查網路連線或 package.json
    pause
    exit /b 1
)

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   安裝完成！                          ║
echo  ║   執行 run.bat 啟動開發伺服器         ║
echo  ╚══════════════════════════════════════╝
echo.
pause
