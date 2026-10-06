$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
$java = "$env:JAVA_HOME\bin\java.exe"
$base = (Resolve-Path "$PSScriptRoot\..\..").Path

Write-Host "Starting API Gateway..."
Start-Process -FilePath $java -ArgumentList "-jar", "backend\api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting Auth Service..."
Start-Process -FilePath $java -ArgumentList "-jar", "backend\auth-service\target\auth-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting Account Service..."
Start-Process -FilePath $java -ArgumentList "-jar", "backend\account-service\target\account-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting Transaction Service..."
Start-Process -FilePath $java -ArgumentList "-jar", "backend\transaction-service\target\transaction-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting Notification Service..."
Start-Process -FilePath $java -ArgumentList "-jar", "backend\notification-service\target\notification-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting Audit Service..."
Start-Process -FilePath $java -ArgumentList "-jar", "backend\audit-service\target\audit-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base -WindowStyle Normal

Write-Host "All services started."
