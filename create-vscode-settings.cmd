@echo off
chcp 65001 >nul
echo Creating VS Code settings...

mkdir "%APPDATA%\Code\User" 2>nul

echo { > "%APPDATA%\Code\User\settings.json"
echo   "workbench.trustedDomains": [ >> "%APPDATA%\Code\User\settings.json"
echo     "https://edu-create.vercel.app", >> "%APPDATA%\Code\User\settings.json"
echo     "https://*.vercel.app", >> "%APPDATA%\Code\User\settings.json"
echo     "http://localhost:3000" >> "%APPDATA%\Code\User\settings.json"
echo   ], >> "%APPDATA%\Code\User\settings.json"
echo   "security.workspace.trust.untrustedFiles": "open" >> "%APPDATA%\Code\User\settings.json"
echo } >> "%APPDATA%\Code\User\settings.json"

echo VS Code settings created successfully!
echo Settings file: %APPDATA%\Code\User\settings.json

mkdir ".vscode" 2>nul
echo { > ".vscode\settings.json"
echo   "workbench.trustedDomains": [ >> ".vscode\settings.json"
echo     "https://edu-create.vercel.app" >> ".vscode\settings.json"
echo   ], >> ".vscode\settings.json"
echo   "security.workspace.trust.untrustedFiles": "open" >> ".vscode\settings.json"
echo } >> ".vscode\settings.json"

echo Workspace settings created!
echo Please restart VS Code to apply changes.
pause
