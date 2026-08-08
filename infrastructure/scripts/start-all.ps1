$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
$javaw = "$env:JAVA_HOME\bin\javaw.exe"
$base = $PSScriptRoot

Write-Host "Starting services in background using javaw..."
Start-Process -FilePath $javaw -ArgumentList "-jar", "api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $javaw -ArgumentList "-jar", "auth-service\target\auth-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $javaw -ArgumentList "-jar", "account-service\target\account-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $javaw -ArgumentList "-jar", "transaction-service\target\transaction-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $javaw -ArgumentList "-jar", "notification-service\target\notification-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base
Start-Process -FilePath $javaw -ArgumentList "-jar", "audit-service\target\audit-service-1.0.0-SNAPSHOT.jar" -WorkingDirectory $base

Write-Host "All services started."
