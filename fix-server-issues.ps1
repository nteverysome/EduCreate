# EduCreate 服務器問題修復腳本 (PowerShell版本)

# 設置顏色
$host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "===================================="
Write-Host "EduCreate 服務器問題修復腳本 (PowerShell版本)"
Write-Host "===================================="
Write-Host ""

# 定義配置
$config = @{
    paths = @{
        icons = Join-Path $PWD "public\icons"
        manifest = Join-Path $PWD "public\manifest.json"
        testTokenApi = Join-Path $PWD "pages\api\auth\test-token.ts"
        searchApi = Join-Path $PWD "pages\api\search\index.ts"
        advancedSearchApi = Join-Path $PWD "pages\api\search\advanced.ts"
        withTestAuthFile = Join-Path $PWD "middleware\withTestAuth.ts"
    }
    icons = @(
        @{ size = "72x72"; filename = "icon-72x72.png" }
        @{ size = "96x96"; filename = "icon-96x96.png" }
        @{ size = "128x128"; filename = "icon-128x128.png" }
        @{ size = "144x144"; filename = "icon-144x144.png" }
        @{ size = "152x152"; filename = "icon-152x152.png" }
        @{ size = "192x192"; filename = "icon-192x192.png" }
        @{ size = "384x384"; filename = "icon-384x384.png" }
        @{ size = "512x512"; filename = "icon-512x512.png" }
    )
}

# 步驟1: 修復圖標404錯誤
Write-Host "步驟1: 修復圖標404錯誤" -ForegroundColor Green
Write-Host "-----------------------------------"

# 確保圖標目錄存在
if (-not (Test-Path $config.paths.icons)) {
    New-Item -Path $config.paths.icons -ItemType Directory -Force | Out-Null
    Write-Host "創建圖標目錄: $($config.paths.icons)"
}

# 檢查並創建每個圖標文件
foreach ($icon in $config.icons) {
    $iconPath = Join-Path $config.paths.icons $icon.filename
    
    if (-not (Test-Path $iconPath)) {
        # 創建簡單的SVG圖標
        $size = $icon.size.Split('x')
        $width = [int]$size[0]
        $height = [int]$size[1]
        $fontSize = [Math]::Floor($width/4)
        
        $svgContent = @"
<svg width="$width" height="$height" xmlns="http://www.w3.org/2000/svg">
  <rect width="$width" height="$height" fill="#4f46e5" />
  <text x="50%" y="50%" font-family="Arial" font-size="$fontSize" fill="white" text-anchor="middle" dominant-baseline="middle">EC</text>
</svg>
"@
        
        Set-Content -Path $iconPath -Value $svgContent
        Write-Host "創建圖標文件: $($icon.filename)"
    } else {
        Write-Host "圖標文件已存在: $($icon.filename)"
    }
}

Write-Host "圖標文件檢查完成"
Write-Host ""

# 步驟2: 更新manifest.json
Write-Host "步驟2: 更新manifest.json" -ForegroundColor Green
Write-Host "-----------------------------------"

if (Test-Path $config.paths.manifest) {
    # 讀取現有manifest
    $manifestContent = Get-Content -Path $config.paths.manifest -Raw
    $manifest = $null
    
    try {
        $manifest = $manifestContent | ConvertFrom-Json
    } catch {
        Write-Host "解析manifest.json失敗: $_" -ForegroundColor Red
    }
    
    if ($manifest) {
        # 確保icons數組存在
        if (-not $manifest.icons) {
            $manifest | Add-Member -NotePropertyName icons -NotePropertyValue @()
        }
        
        # 檢查每個圖標是否在manifest中
        $updated = $false
        
        foreach ($icon in $config.icons) {
            $size = $icon.size
            $iconExists = $false
            
            foreach ($i in $manifest.icons) {
                if ($i.src -eq "/icons/$($icon.filename)" -and $i.sizes -eq $icon.size) {
                    $iconExists = $true
                    break
                }
            }
            
            if (-not $iconExists) {
                $newIcon = [PSCustomObject]@{
                    src = "/icons/$($icon.filename)"
                    sizes = $icon.size
                    type = "image/png"
                    purpose = "any maskable"
                }
                
                $manifest.icons += $newIcon
                $updated = $true
            }
        }
        
        # 如果有更新，寫入文件
        if ($updated) {
            $manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $config.paths.manifest
            Write-Host "更新manifest.json完成"
        } else {
            Write-Host "manifest.json已包含所有圖標，無需更新"
        }
    }
} else {
    Write-Host "manifest.json不存在，創建新文件..."
    
    # 創建新的manifest.json
    $icons = @()
    foreach ($icon in $config.icons) {
        $icons += [PSCustomObject]@{
            src = "/icons/$($icon.filename)"
            sizes = $icon.size
            type = "image/png"
            purpose = "any maskable"
        }
    }
    
    $manifest = [PSCustomObject]@{
        name = "EduCreate"
        short_name = "EduCreate"
        description = "互動式教育資源創建平台"
        start_url = "/"
        display = "standalone"
        background_color = "#ffffff"
        theme_color = "#4f46e5"
        orientation = "portrait-primary"
        icons = $icons
    }
    
    $manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $config.paths.manifest
    Write-Host "創建manifest.json完成"
}

Write-Host ""

# 步驟3: 運行Prisma遷移和種子
Write-Host "步驟3: 運行Prisma遷移和種子" -ForegroundColor Green
Write-Host "-----------------------------------"

try {
    Write-Host "運行Prisma遷移..."
    npx prisma migrate dev --name add-test-users
    
    Write-Host "運行Prisma種子..."
    npx prisma db seed
    
    Write-Host "Prisma遷移和種子運行完成"
} catch {
    Write-Host "運行Prisma遷移和種子失敗: $_" -ForegroundColor Red
    Write-Host "請手動運行以下命令:" -ForegroundColor Yellow
    Write-Host "1. npm install -D ts-node" -ForegroundColor Yellow
    Write-Host "2. npx prisma migrate dev --name add-test-users" -ForegroundColor Yellow
    Write-Host "3. npx prisma db seed" -ForegroundColor Yellow
}

Write-Host ""

# 步驟4: 重啟服務器
Write-Host "步驟4: 重啟服務器" -ForegroundColor Green
Write-Host "-----------------------------------"
Write-Host "修復完成！請按任意鍵重啟開發服務器..."
Pause

# 終止可能佔用端口的進程
Write-Host "正在檢查並終止佔用端口3000, 3001, 3002的進程..."

$ports = @(3000, 3001, 3002)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        $processName = (Get-Process -Id $process).ProcessName
        Write-Host "終止佔用端口 $port 的進程 PID: $process ($processName)"
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    }
}

# 清理緩存
Write-Host "清理.next目錄..."
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host ".next目錄已清理"
}

# 啟動開發服務器
Write-Host "正在啟動開發服務器，請在瀏覽器中訪問 http://localhost:3000"
Write-Host "如果仍然無法訪問，請嘗試 http://127.0.0.1:3000"
Write-Host "按Ctrl+C可以停止服務器"
Write-Host ""

npm run dev