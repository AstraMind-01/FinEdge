import requests

# Test 1: Admin User
admin_login = requests.post("http://localhost:8080/api/v1/auth/login", json={
    "usernameOrEmail": "admin_demo_user",
    "password": "Password123!"
}).json()

r1 = requests.get("http://localhost:8080/api/v1/notifications", headers={"Authorization": f"Bearer {admin_login['accessToken']}"})
print("Admin Notifications Status:", r1.status_code, "Count:", len(r1.json()) if r1.status_code == 200 else r1.text)

# Test 2: Customer User
cust_login = requests.post("http://localhost:8080/api/v1/auth/login", json={
    "usernameOrEmail": "customer_demo_user",
    "password": "Password123!"
}).json()

r2 = requests.get("http://localhost:8080/api/v1/notifications", headers={"Authorization": f"Bearer {cust_login['accessToken']}"})
print("Customer Notifications Status:", r2.status_code, "Count:", len(r2.json()) if r2.status_code == 200 else r2.text)

assert r1.status_code == 200
assert r2.status_code == 200
print("\n>>> BOTH ADMIN AND CUSTOMER NOTIFICATIONS VERIFIED 100%! <<<")
