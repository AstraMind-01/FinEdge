@echo off
cd /d "%~dp0"
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.12
set PATH=%JAVA_HOME%\bin;%PATH%

echo Starting api-gateway...
start /b "" "%JAVA_HOME%\bin\java.exe" -jar api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar > api-gateway.log 2>&1
timeout /t 5 /nobreak > NUL

echo Starting auth-service...
start /b "" "%JAVA_HOME%\bin\java.exe" -jar auth-service\target\auth-service-1.0.0-SNAPSHOT.jar > auth.log 2>&1
timeout /t 5 /nobreak > NUL

echo Starting account-service...
start /b "" "%JAVA_HOME%\bin\java.exe" -jar account-service\target\account-service-1.0.0-SNAPSHOT.jar > account.log 2>&1
timeout /t 5 /nobreak > NUL

echo Starting transaction-service...
start /b "" "%JAVA_HOME%\bin\java.exe" -jar transaction-service\target\transaction-service-1.0.0-SNAPSHOT.jar > transaction.log 2>&1
timeout /t 5 /nobreak > NUL

echo Starting notification-service...
start /b "" "%JAVA_HOME%\bin\java.exe" -jar notification-service\target\notification-service-1.0.0-SNAPSHOT.jar > notification.log 2>&1
timeout /t 5 /nobreak > NUL

echo Starting audit-service...
start /b "" "%JAVA_HOME%\bin\java.exe" -jar audit-service\target\audit-service-1.0.0-SNAPSHOT.jar > audit.log 2>&1

echo All services launched!
