@echo off
echo ========================================
echo Configurando Android SDK
echo ========================================
echo.

REM Configurar ANDROID_HOME
setx ANDROID_HOME "C:\Users\sebastianlevin\AppData\Local\Android\Sdk"

REM Obtener el valor actual de Path del sistema
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path') do set SYSPATH=%%b

REM Agregar las rutas de Android al Path
setx Path "%SYSPATH%;C:\Users\sebastianlevin\AppData\Local\Android\Sdk\platform-tools;C:\Users\sebastianlevin\AppData\Local\Android\Sdk\emulator;C:\Users\sebastianlevin\AppData\Local\Android\Sdk\tools"

echo.
echo ========================================
echo Configuracion completada!
echo ========================================
echo.
echo IMPORTANTE: 
echo 1. Cierra TODAS las ventanas de terminal/CMD/PowerShell
echo 2. Abre una nueva terminal
echo 3. Ejecuta: adb --version
echo.
echo Si ves la version de adb, la configuracion fue exitosa!
echo ========================================
pause



