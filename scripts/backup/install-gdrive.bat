@echo off
echo Installing gdrive CLI...
cd /d "C:\Program Files\Go\bin"
go.exe install github.com/prasmussen/gdrive@latest
echo.
echo Installation completed!
echo.
echo Adding Go to PATH...
setx PATH "%PATH%;C:\Program Files\Go\bin"
echo.
echo Please restart your terminal and try: gdrive --version
pause
