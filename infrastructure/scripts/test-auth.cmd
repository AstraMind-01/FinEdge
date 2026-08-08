@echo off
cd /d "%~dp0"
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.12
set PATH=%JAVA_HOME%\bin;%PATH%

echo Running auth service...
"%JAVA_HOME%\bin\java.exe" -jar auth-service\target\auth-service-1.0.0-SNAPSHOT.jar
echo Exited with code %errorlevel%
pause
