@echo off
setlocal

:: Path to the real ollama.exe
set "OLLAMA_EXE=ollama.exe"

:: Check first argument
if "%~1"=="launch" (
    if "%~2"=="hodeuscli" (
        :: Launch Hodeuscli
        hodeuscli %~3 %~4 %~5 %~6 %~7 %~8 %~9
        exit /b %errorlevel%
    )
)

:: Otherwise pass to real ollama
"%OLLAMA_EXE%" %*
exit /b %errorlevel%
