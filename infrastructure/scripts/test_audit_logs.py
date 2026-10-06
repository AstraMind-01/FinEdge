import requests

# Login as admin to get admin token
login_resp = requests.post("http://localhost:8080/api/v1/auth/login", json={
    "usernameOrEmail": "admin_demo_user",
    "password": "Password123!"
})
token = login_resp.json().get("accessToken")

# Fetch audit logs
r = requests.get("http://localhost:8080/api/v1/audit-logs", headers={"Authorization": f"Bearer {token}"})
print("Audit Logs Status:", r.status_code)
print("Audit Logs Count:", len(r.json()))
for item in r.json():
    print(f" - [{item['action']}] By: {item['performedByUsername']} | Ref: {item['transactionRef']} | Details: {item['details']}")

assert r.status_code == 200
assert len(r.json()) > 0
print("\n>>> AUDIT LOGS VERIFIED 100%! <<<")
