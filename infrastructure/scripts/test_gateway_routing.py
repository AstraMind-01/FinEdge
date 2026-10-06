import requests

r1 = requests.post("http://localhost:8080/api/v1/auth/register", json={
    "username": "gw_user_check",
    "email": "gw_user_check@finedge.io",
    "password": "Password123!"
})
print("1. API Gateway Auth Register status:", r1.status_code)
token = r1.json().get("accessToken")

r2 = requests.post("http://localhost:8080/api/v1/customers/kyc", json={
    "fullName": "Gateway Tester",
    "dateOfBirth": "1990-01-01",
    "phoneNumber": "9876543210",
    "address": "100 Gateway Way",
    "governmentIdType": "PASSPORT",
    "governmentIdNumber": "P11223344"
}, headers={"Authorization": f"Bearer {token}"})
print("2. API Gateway KYC Submit status:", r2.status_code)

r3 = requests.post("http://localhost:8080/api/v1/auth/login", json={
    "usernameOrEmail": "gw_user_check",
    "password": "Password123!"
})
print("3. API Gateway Auth Login status:", r3.status_code)
token_verified = r3.json().get("accessToken")

r4 = requests.post("http://localhost:8080/api/v1/accounts", json={
    "accountType": "SAVINGS",
    "initialDeposit": 5000.0
}, headers={"Authorization": f"Bearer {token_verified}"})
print("4. API Gateway Account Creation status:", r4.status_code, "Account Number:", r4.json().get("accountNumber"))

assert r1.status_code == 201
assert r2.status_code == 201
assert r3.status_code == 200
assert r4.status_code == 201
print("\n>>> ALL API GATEWAY ROUTE TESTS PASSED 100%! <<<")
