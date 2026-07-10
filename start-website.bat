@echo off
setlocal
set PORT=8080

where py >nul 2>nul
if %errorlevel%==0 (
    echo Starting local website at http://localhost:%PORT%/
    start "" http://localhost:%PORT%/
    py -3 -m http.server %PORT%
    exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
    echo Starting local website at http://localhost:%PORT%/
    start "" http://localhost:%PORT%/
    python -m http.server %PORT%
    exit /b
)

echo Python was not found. Opening index.html directly instead.
start "" index.html
