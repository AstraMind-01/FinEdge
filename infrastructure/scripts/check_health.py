"""
Full Stack Health Check Verification Script
"""
import requests
import json

services = [
    ("API Gateway", "http://localhost:8080/api/v1/health"),
    ("Auth Service", "http://localhost:8081/api/v1/health"),
    ("Account Service", "http://localhost:8082/api/v1/health"),
    ("Transaction Service", "http://localhost:8083/api/v1/health"),
    ("Notification Service", "http://localhost:8084/api/v1/health"),
    ("Audit Service", "http://localhost:8085/api/v1/health"),
    ("Fraud Detection Service", "http://localhost:8086/api/v1/health"),
]

def check_all_health():
    print("\n==================================================")
    print("  Full Stack Service Health Verification          ")
    print("==================================================")
    all_healthy = True
    for name, url in services:
        try:
            r = requests.get(url, timeout=3)
            status = "UP" if r.status_code == 200 else f"DOWN ({r.status_code})"
            print(f"  [{status}] {name:<25} -> {url}")
            if r.status_code != 200:
                all_healthy = False
        except Exception as e:
            print(f"  [DOWN] {name:<25} -> {url} ({e})")
            all_healthy = False
    print("==================================================")
    return all_healthy

if __name__ == "__main__":
    check_all_health()
