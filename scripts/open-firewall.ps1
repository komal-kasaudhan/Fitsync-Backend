# ==============================================================================
# FitSync Backend - Windows Defender Firewall Configuration
# ==============================================================================
# This script adds an inbound TCP firewall rule for port 8000 to allow your
# physical phone (OnePlus) to access the FitSync backend server over Wi-Fi LAN.
#
# IMPORTANT:
# 1. This script MUST be executed in PowerShell with "Run as Administrator".
# 2. Ensure your Wi-Fi network profile in Windows is set to "Private" (not "Public"):
#    Windows Settings -> Network & internet -> Wi-Fi -> [Your Network] -> Network profile type -> "Private".
# ==============================================================================

$RuleName = "FitSync Backend 8000"
$Port = 8000

Write-Host "Checking for existing firewall rule: '$RuleName'..." -ForegroundColor Cyan

$existing = Get-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue

if ($existing) {
    Write-Host "Updating existing firewall rule '$RuleName' for port $Port..." -ForegroundColor Yellow
    Set-NetFirewallRule -DisplayName $RuleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port -Profile Private,Public -Enabled True
} else {
    Write-Host "Creating new inbound firewall rule '$RuleName' for port $Port..." -ForegroundColor Green
    New-NetFirewallRule -DisplayName $RuleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port -Profile Private,Public -Enabled True
}

Write-Host "`n✅ Inbound TCP Rule '$RuleName' configured for port $Port across Private and Public profiles." -ForegroundColor Green
Write-Host "👉 Next step: Open http://<LAN-IP>:$Port/api/health on your phone's browser to test." -ForegroundColor Cyan
