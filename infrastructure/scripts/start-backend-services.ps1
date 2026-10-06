$java = (Get-Command java -ErrorAction SilentlyContinue).Source
if (-not $java) { $java = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot\bin\java.exe" }
$base = (Resolve-Path "$PSScriptRoot\..\..").Path
$logsDir = Join-Path $base "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

Write-Host "Using Java executable: $java"
Write-Host "Base directory: $base"

$services = @(
    @{ Name = "auth-service"; Jar = "backend\auth-service\target\auth-service-1.0.0-SNAPSHOT.jar"; Port = 8081 },
    @{ Name = "account-service"; Jar = "backend\account-service\target\account-service-1.0.0-SNAPSHOT.jar"; Port = 8082 },
    @{ Name = "transaction-service"; Jar = "backend\transaction-service\target\transaction-service-1.0.0-SNAPSHOT.jar"; Port = 8083 },
    @{ Name = "notification-service"; Jar = "backend\notification-service\target\notification-service-1.0.0-SNAPSHOT.jar"; Port = 8084 },
    @{ Name = "audit-service"; Jar = "backend\audit-service\target\audit-service-1.0.0-SNAPSHOT.jar"; Port = 8085 },
    @{ Name = "api-gateway"; Jar = "backend\api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar"; Port = 8080 }
)

foreach ($svc in $services) {
    Write-Host "Starting $($svc.Name)..."
    $stdout = Join-Path $logsDir "$($svc.Name).log"
    $stderr = Join-Path $logsDir "$($svc.Name)-err.log"
    Start-Process -FilePath $java -ArgumentList "-jar", $svc.Jar -WorkingDirectory $base -RedirectStandardOutput $stdout -RedirectStandardError $stderr -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

Write-Host "All Java services have been launched."
