@echo off
echo Testing MCP Filesystem Server...
echo.
echo Current directory: %CD%
echo.
echo Testing npx command:
npx @shtse8/filesystem-mcp --version
echo.
echo If you see the server starting message above, MCP is working correctly!
echo Press any key to exit...
pause > nul
