$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
$java = "$env:JAVA_HOME\bin\java.exe"
$base = $PSScriptRoot

Start-Job -Name auth -ScriptBlock { param($b, $j) cd $b; & $j -jar auth-service\target\auth-service-1.0.0-SNAPSHOT.jar } -ArgumentList $base, $java
Start-Job -Name api -ScriptBlock { param($b, $j) cd $b; & $j -jar api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar } -ArgumentList $base, $java

Start-Sleep -Seconds 15
Get-Job | Receive-Job
