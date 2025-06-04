Write-Host ""
Write-Host "===== PostgreSQL Connection Fix Tool =====" -ForegroundColor Cyan

$serviceNames = @(
    "postgresql-x64-17",   
    "postgresql-x64-16",
    "postgresql-x64-15",
    "postgresql-x64-14",
    "postgresql-x64-13",
    "postgresql-x64-12"
)

$found = $false
foreach ($svcName in $serviceNames) {
    $svc = Get-Service -Name $svcName -ErrorAction SilentlyContinue
    if ($svc) {
        $found = $true
        $status = if ($svc.Status -eq "Running") {"[Running]"} else {"[Stopped]"}
        Write-Host "   $status $($svc.Name) - $($svc.Status)" -ForegroundColor Gray
    }
}

if (-not $found) {
    Write-Host "No PostgreSQL service found." -ForegroundColor Red
    Write-Host "Please confirm that PostgreSQL is installed." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Trying to restart PostgreSQL service..." -ForegroundColor Yellow

foreach ($svcName in $serviceNames) {
    $svc = Get-Service -Name $svcName -ErrorAction SilentlyContinue
    if ($svc) {
        try {
            if ($svc.Status -eq "Running") {
                Restart-Service -Name $svcName -Force
                Write-Host "Restarted $svcName" -ForegroundColor Green
            } else {
                Start-Service -Name $svcName
                Write-Host "Started $svcName" -ForegroundColor Green
            }
        } catch {
            Write-Host "Unable to start or restart $svcName, please run as administrator." -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "If you still can't connect, please run manually:" -ForegroundColor Magenta
$installed = $serviceNames | Where-Object { (Get-Service -Name $_ -ErrorAction SilentlyContinue) }
if ($installed) {
    Write-Host ("   net start " + ($installed | Select-Object -First 1)) -ForegroundColor Green
}
Write-Host ""
Write-Host "If you see database connection errors, check firewall settings or try restarting your computer." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
