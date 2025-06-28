@echo off
setlocal

echo.
echo   FUNCIONÁRIO IA - SISTEMA DE AGENTES
echo   ====================================
echo.

REM Verifica se o Node.js está instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado. Por favor, instale-o para continuar.
    echo        https://nodejs.org/
    pause
    exit /b 1
)

REM Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar as dependencias. Verifique sua conexao ou o npm.
        pause
        exit /b 1
    )
)

echo [INFO] Iniciando o sistema...
start http://localhost:5173
npm run dev

endlocal 