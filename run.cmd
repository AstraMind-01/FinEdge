@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.12
set PATH=%JAVA_HOME%\bin;%PATH%

start /b java -jar auth-service\target\auth-service-1.0.0-SNAPSHOT.jar > auth.log 2>&1
start /b java -jar account-service\target\account-service-1.0.0-SNAPSHOT.jar > account.log 2>&1
start /b java -jar transaction-service\target\transaction-service-1.0.0-SNAPSHOT.jar > transaction.log 2>&1
start /b java -jar notification-service\target\notification-service-1.0.0-SNAPSHOT.jar > notification.log 2>&1
start /b java -jar audit-service\target\audit-service-1.0.0-SNAPSHOT.jar > audit.log 2>&1
start /b java -jar api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar > api-gateway.log 2>&1
echo "All Java microservices started!"
