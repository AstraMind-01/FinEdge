$java = (Get-Command java -ErrorAction SilentlyContinue).Source
if (-not $java) { $java = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot\bin\java.exe" }
$base = (Resolve-Path "$PSScriptRoot\..\..").Path

Write-Host "Starting services in background using javaw..."
Start-Process -FilePath $java -ArgumentList "-jar", "backend\api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $java -ArgumentList "-jar", "backend\auth-service\target\auth-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $java -ArgumentList "-jar", "backend\account-service\target\account-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $java -ArgumentList "-jar", "backend\transaction-service\target\transaction-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $java -ArgumentList "-jar", "backend\notification-service\target\notification-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $java -ArgumentList "-jar", "backend\audit-service\target\audit-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base

Write-Host "All services started."
