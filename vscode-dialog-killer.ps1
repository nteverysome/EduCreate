# VS Code 對話框自動處理腳本
# 這個腳本會自動配置 VS Code 設置並處理對話框

param(
    [switch]$Force,
    [switch]$Silent
)

Write-Host "🤖 VS Code 對話框自動處理器" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# 1. 強制創建 VS Code 設置
$settingsPath = "$env:APPDATA\Code\User\settings.json"
$settingsDir = "$env:APPDATA\Code\User"

Write-Host "📁 檢查 VS Code 設置目錄..." -ForegroundColor Yellow

# 創建目錄
if (!(Test-Path $settingsDir)) {
    New-Item -ItemType Directory -Path $settingsDir -Force | Out-Null
    Write-Host "✅ 創建 VS Code 用戶目錄" -ForegroundColor Green
}

# 2. 創建完整的設置文件
$settings = @{
    "workbench.trustedDomains" = @(
        "https://edu-create.vercel.app",
        "https://*.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000"
    )
    "security.workspace.trust.untrustedFiles" = "open"
    "workbench.externalUriOpeners" = @{
        "https://edu-create.vercel.app" = "default"
        "https://*.vercel.app" = "default"
    }
    "workbench.trustedDomains.promptInTrustedWorkspace" = $false
    "security.workspace.trust.banner" = "never"
    "security.workspace.trust.startupPrompt" = "never"
    "security.workspace.trust.enabled" = $false
}

# 3. 讀取現有設置並合併
$existingSettings = @{}
if (Test-Path $settingsPath) {
    try {
        $content = Get-Content $settingsPath -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $existingSettings = $content | ConvertFrom-Json -AsHashtable -ErrorAction SilentlyContinue
        }
    }
    catch {
        Write-Host "⚠️ 現有設置文件有問題，將重新創建" -ForegroundColor Yellow
    }
}

# 4. 合併設置
foreach ($key in $settings.Keys) {
    $existingSettings[$key] = $settings[$key]
}

# 5. 寫入設置文件
try {
    $jsonContent = $existingSettings | ConvertTo-Json -Depth 10
    $jsonContent | Out-File -FilePath $settingsPath -Encoding UTF8 -Force
    Write-Host "✅ VS Code 設置已更新" -ForegroundColor Green
}
catch {
    Write-Host "❌ 無法寫入設置文件: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. 創建工作區設置（額外保險）
$workspaceSettingsPath = ".vscode\settings.json"
$workspaceDir = ".vscode"

if (!(Test-Path $workspaceDir)) {
    New-Item -ItemType Directory -Path $workspaceDir -Force | Out-Null
}

$workspaceSettings = @{
    "workbench.trustedDomains" = @(
        "https://edu-create.vercel.app",
        "https://*.vercel.app"
    )
    "security.workspace.trust.untrustedFiles" = "open"
}

$workspaceSettings | ConvertTo-Json -Depth 10 | Out-File -FilePath $workspaceSettingsPath -Encoding UTF8 -Force
Write-Host "✅ 工作區設置已創建" -ForegroundColor Green

# 7. 使用 Windows API 自動處理對話框
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class WindowsAPI {
    [DllImport("user32.dll")]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    
    [DllImport("user32.dll")]
    public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);
    
    [DllImport("user32.dll")]
    public static extern bool SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
    
    [DllImport("user32.dll")]
    public static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
    
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    
    public const uint WM_COMMAND = 0x0111;
    public const uint WM_KEYDOWN = 0x0100;
    public const uint WM_CHAR = 0x0102;
    public const uint BM_CLICK = 0x00F5;
    public const int SW_SHOW = 5;
}
"@

# 8. 監控並自動處理 VS Code 對話框
function Handle-VSCodeDialog {
    Write-Host "🔍 監控 VS Code 對話框..." -ForegroundColor Yellow
    
    for ($i = 0; $i -lt 30; $i++) {
        # 查找 VS Code 對話框
        $dialogWindow = [WindowsAPI]::FindWindow($null, "Visual Studio Code")
        
        if ($dialogWindow -ne [IntPtr]::Zero) {
            # 查找 "Open" 按鈕
            $openButton = [WindowsAPI]::FindWindowEx($dialogWindow, [IntPtr]::Zero, "Button", "Open")
            
            if ($openButton -ne [IntPtr]::Zero) {
                Write-Host "✅ 找到對話框，自動點擊 Open" -ForegroundColor Green
                [WindowsAPI]::SendMessage($openButton, [WindowsAPI]::BM_CLICK, [IntPtr]::Zero, [IntPtr]::Zero)
                return $true
            }
            
            # 查找 "Configure Trusted Domains" 按鈕
            $configButton = [WindowsAPI]::FindWindowEx($dialogWindow, [IntPtr]::Zero, "Button", "Configure Trusted Domains")
            
            if ($configButton -ne [IntPtr]::Zero) {
                Write-Host "✅ 找到配置按鈕，自動點擊" -ForegroundColor Green
                [WindowsAPI]::SendMessage($configButton, [WindowsAPI]::BM_CLICK, [IntPtr]::Zero, [IntPtr]::Zero)
                return $true
            }
        }
        
        Start-Sleep -Milliseconds 500
    }
    
    return $false
}

# 9. 重啟 VS Code
Write-Host "🔄 重啟 VS Code..." -ForegroundColor Yellow

# 關閉現有的 VS Code 進程
Get-Process -Name "Code" -ErrorAction SilentlyContinue | ForEach-Object {
    $_.CloseMainWindow()
    Start-Sleep -Seconds 1
    if (!$_.HasExited) {
        $_.Kill()
    }
}

Start-Sleep -Seconds 2

# 重新啟動 VS Code
if (Test-Path "code") {
    Start-Process "code" -ArgumentList "." -WindowStyle Normal
} else {
    # 嘗試從常見路徑啟動
    $codePaths = @(
        "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe",
        "$env:PROGRAMFILES\Microsoft VS Code\Code.exe",
        "$env:PROGRAMFILES(X86)\Microsoft VS Code\Code.exe"
    )
    
    foreach ($path in $codePaths) {
        if (Test-Path $path) {
            Start-Process $path -ArgumentList "." -WindowStyle Normal
            break
        }
    }
}

Write-Host "⏳ 等待 VS Code 啟動..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 10. 啟動對話框監控
if (!$Silent) {
    Write-Host "🤖 啟動自動對話框處理..." -ForegroundColor Cyan
    $handled = Handle-VSCodeDialog
    
    if ($handled) {
        Write-Host "🎉 對話框已自動處理！" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ 未檢測到對話框，設置可能已生效" -ForegroundColor Blue
    }
}

Write-Host ""
Write-Host "🎉 完成！VS Code 現在應該會自動打開外部鏈接" -ForegroundColor Green
Write-Host "📝 設置文件: $settingsPath" -ForegroundColor Cyan
Write-Host "🧪 請測試點擊 EduCreate 鏈接" -ForegroundColor Yellow
