@echo off
setlocal

:: Path to the real ollama.exe
set "OLLAMA_EXE=ollama.exe"

:: Check first argument
if "%~1"=="launch" (
    if "%~2"=="hodeuscli" (
        set "full_cmd=%*"
        set "hodeus_args=!full_cmd:*launch hodeuscli=!"
        hodeuscli !hodeus_args!
        exit /b !errorlevel!
    )
)

:: Otherwise pass to real ollama
"%OLLAMA_EXE%" %*
exit /b %errorlevel%
