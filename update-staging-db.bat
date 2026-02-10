@echo off
REM Windows batch script to update staging database
REM Usage: update-staging-db.bat

echo.
echo ========================================
echo   Staging Database Update Script
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if SQL file exists
if not exist "production_data_inserts.sql" (
    echo ❌ SQL file not found: production_data_inserts.sql
    echo Please run the JSON to SQL conversion first:
    echo python json_to_sql.py
    pause
    exit /b 1
)

REM Get database connection string
if defined STAGING_DB_CONNECTION (
    set DB_CONN=%STAGING_DB_CONNECTION%
) else (
    echo Please enter your staging database connection string:
    echo Example: postgresql://user:password@host:port/database
    set /p DB_CONN="Connection: "
)

if "%DB_CONN%"=="" (
    echo ❌ No database connection provided
    pause
    exit /b 1
)

echo.
echo 📄 SQL file: production_data_inserts.sql
echo 🎯 Target database: %DB_CONN%
echo.

REM Confirm before proceeding
set /p CONFIRM="⚠️  This will update the staging database. Continue? (y/N): "
if /i not "%CONFIRM%"=="y" if /i not "%CONFIRM%"=="yes" (
    echo ❌ Operation cancelled
    pause
    exit /b 0
)

echo.
echo 🚀 Updating staging database...

REM Set environment variable for Python script
set STAGING_DB_CONNECTION=%DB_CONN%

REM Run the Python script
python update-staging-db.py

if errorlevel 1 (
    echo.
    echo ❌ Failed to update staging database
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Staging database updated successfully!
    pause
)
