$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
$java = "$env:JAVA_HOME\bin\java.exe"
$base = $PSScriptRoot

Start-Job -Name api -ScriptBlock { param($b, $j) cd $b; & $j -jar api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar } -ArgumentList $base, $java
Start-Job -Name auth -ScriptBlock { param($b, $j) cd $b; & $j -jar auth-service\target\auth-service-1.0.0-SNAPSHOT.jar } -ArgumentList $base, $java
Start-Job -Name account -ScriptBlock { param($b, $j) cd $b; & $j -jar account-service\target\account-service-1.0.0-SNAPSHOT.jar } -ArgumentList $base, $java
Start-Job -Name transaction -ScriptBlock { param($b, $j) cd $b; & $j -jar transaction-service\target\transaction-service-1.0.0-SNAPSHOT.jar } -ArgumentList $base, $java
Start-Job -Name notification -ScriptBlock { param($b, $j) cd $b; & $j -jar notification-service\target\notification-service-1.0.0-SNAPSHOT.jar } -ArgumentList $base, $java
Start-Job -Name audit -ScriptBlock { param($b, $j) cd $b; & $j -jar audit-service\target\audit-service-1.0.0-SNAPSHOT.jar } -ArgumentList $base, $java

while($true) {
    Start-Sleep -Seconds 60
    Get-Job | Receive-Job
}
