@echo off
cd /d "%~dp0..\.."
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.12
set PATH=%JAVA_HOME%\bin;%PATH%

start "API Gateway" "%JAVA_HOME%\bin\java.exe" -jar backend\api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar
start "Auth Service" "%JAVA_HOME%\bin\java.exe" -jar backend\auth-service\target\auth-service-1.0.0-SNAPSHOT.jar
start "Account Service" "%JAVA_HOME%\bin\java.exe" -jar backend\account-service\target\account-service-1.0.0-SNAPSHOT.jar
start "Transaction Service" "%JAVA_HOME%\bin\java.exe" -jar backend\transaction-service\target\transaction-service-1.0.0-SNAPSHOT.jar
start "Notification Service" "%JAVA_HOME%\bin\java.exe" -jar backend\notification-service\target\notification-service-1.0.0-SNAPSHOT.jar
start "Audit Service" "%JAVA_HOME%\bin\java.exe" -jar backend\audit-service\target\audit-service-1.0.0-SNAPSHOT.jar
