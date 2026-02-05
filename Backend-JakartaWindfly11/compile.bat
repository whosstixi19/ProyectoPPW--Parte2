@echo off
echo ========================================
echo Compilando Backend Jakarta
echo ========================================

cd /d "%~dp0"

REM Buscar Maven
where mvn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Maven encontrado, compilando...
    call mvn clean package
) else (
    echo Maven no encontrado en PATH
    echo Por favor compila el proyecto desde tu IDE Eclipse/IntelliJ
    echo O instala Maven y agregalo al PATH
    pause
)

echo.
echo ========================================
echo Compilacion completada!
echo Ahora reinicia WildFly/JBoss
echo ========================================
pause
