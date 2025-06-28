@echo off
echo.
echo ========================================
echo   FUNCIONARIO IA - SISTEMA DE AGENTES
echo ========================================
echo.

echo Verificando se Node.js esta instalado...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao esta instalado!
    echo Por favor, instale o Node.js primeiro.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado! Continuando...
echo.

echo Instalando dependencias...
npm install

if %errorlevel% neq 0 (
    echo.
    echo ERRO na instalacao das dependencias!
    echo Tentando com npm clean...
    npm cache clean --force
    npm install
)

echo.
echo Iniciando o sistema...
echo.
echo O sistema sera aberto no navegador automaticamente.
echo Para parar o sistema, pressione Ctrl+C
echo.

start http://localhost:8080

npm run dev

pause 