@echo off
setlocal
if not exist build mkdir build
g++ -std=c++17 -Wall -Wextra -pedantic src\main.cpp -o build\SmartLibraryDSA.exe
if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
)
echo Build complete: build\SmartLibraryDSA.exe
