@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════╗
echo  ║   ArchLens Web — 啟動開發伺服器      ║
echo  ╚══════════════════════════════════════╝
echo.

:: ── 確認 node_modules 存在 ──
if not exist "node_modules\" (
    echo  [WARN] 找不到 node_modules，請先執行 setup.bat
    echo.
    pause
    exit /b 1
)

echo  [INFO] 啟動 Vite dev server...
echo  [INFO] 瀏覽器將自動開啟 http://localhost:5173
echo  [INFO] 關閉此視窗即可停止伺服器
echo.

:: 延遲 2 秒後開啟瀏覽器（等 Vite 起來）
start "" cmd /c "timeout /t 2 >nul && start http://localhost:5173"

:: 啟動 Vite（前景執行，Ctrl+C 可停止）
npm run dev

echo.
echo  [INFO] 伺服器已停止
pause
