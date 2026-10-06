"""
Step 19 Account Service Live Verification Script
"""
import time
import requests
import json
import base64

AUTH_SERVICE_URL = "http://localhost:8081"
ACCOUNT_SERVICE_URL = "http://localhost:8082"

def test_step19_flow():
    print("\n==================================================")
    print("  Step 19 Account Service Live Endpoint Test       ")
    print("==================================================")

    # Setup User 1 (Unverified KYC initially)
    user1_name = f"step19_u1_{int(time.time())}"
    password = "Password123!"

    r = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/register", json={
        "username": user1_name,
        "email": f"{user1_name}@finedge.io",
        "password": password
    })
    token_u1_unverified = r.json().get("accessToken")

    # 1. Account Creation Blocked by Unverified KYC
    headers_u1_unverified = {"Authorization": f"Bearer {token_u1_unverified}"}
    r = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts", json={
        "accountType": "SAVINGS",
        "initialDeposit": 100.0
    }, headers=headers_u1_unverified)

    print(f"\n1. POST /accounts with Unverified KYC: Status {r.status_code}")
    print(f"   Response: {r.text}")
    assert r.status_code == 403
    assert "KYC_NOT_VERIFIED" in r.text or "VERIFIED" in r.text

    # Complete KYC for User 1
    requests.post(f"{AUTH_SERVICE_URL}/api/v1/customers/kyc", json={
        "fullName": "Step Nineteen User",
        "dateOfBirth": "1995-01-01",
        "phoneNumber": "9876543210",
        "address": "19 Innovation Way",
        "governmentIdType": "AADHAAR",
        "governmentIdNumber": "999988887777"
    }, headers=headers_u1_unverified)

    # Re-login to acquire JWT with kycStatus: VERIFIED
    r = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/login", json={
        "usernameOrEmail": user1_name,
        "password": password
    })
    token_u1_verified = r.json().get("accessToken")
    headers_u1_verified = {"Authorization": f"Bearer {token_u1_verified}"}

    # 2. Account Creation Succeeding after VERIFIED KYC
    r = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts", json={
        "accountType": "SAVINGS",
        "initialDeposit": 500.0
    }, headers=headers_u1_verified)

    print(f"\n2. POST /accounts with VERIFIED KYC: Status {r.status_code}")
    account1 = r.json()
    print(f"   Created Account: #{account1.get('accountNumber')}, Balance: ${account1.get('balance')}")
    assert r.status_code == 201
    account1_id = account1.get("id")
    account1_num = account1.get("accountNumber")

    # Setup User 2 (Joint Holder Candidate)
    user2_name = f"step19_u2_{int(time.time())}"
    requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/register", json={
        "username": user2_name,
        "email": f"{user2_name}@finedge.io",
        "password": password
    })

    # 3. Add, List, and Remove Joint Holder
    r = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{account1_id}/joint-holders", json={
        "jointUsername": user2_name
    }, headers=headers_u1_verified)
    print(f"\n3a. POST /accounts/{account1_id}/joint-holders: Status {r.status_code}")
    print(f"    Joint Holder Added: {r.json()}")
    assert r.status_code == 201

    r = requests.get(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{account1_id}/joint-holders", headers=headers_u1_verified)
    print(f"3b. GET /accounts/{account1_id}/joint-holders: Status {r.status_code}")
    print(f"    Joint Holders List: {r.json()}")
    assert r.status_code == 200
    assert len(r.json()) == 1

    r = requests.delete(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{account1_id}/joint-holders/{user2_name}", headers=headers_u1_verified)
    print(f"3c. DELETE /accounts/{account1_id}/joint-holders/{user2_name}: Status {r.status_code}")
    assert r.status_code == 204

    # 4. Add Nominee Exceeding 100% Share (Rejected)
    # Add Nominee 1 with 70% share
    requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{account1_id}/nominees", json={
        "nomineeName": "Primary Nominee",
        "relationship": "SPOUSE",
        "phoneNumber": "9876543210",
        "sharePercentage": 70.0
    }, headers=headers_u1_verified)

    # Attempt Nominee 2 with 40% share (Total 110% -> Rejected)
    r = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{account1_id}/nominees", json={
        "nomineeName": "Secondary Nominee",
        "relationship": "CHILD",
        "phoneNumber": "9876543211",
        "sharePercentage": 40.0
    }, headers=headers_u1_verified)
    print(f"\n4. POST /nominees (Total Share 110% > 100%): Status {r.status_code}")
    print(f"   Response: {r.text}")
    assert r.status_code in [400, 500]

    # 5. Closing Account with Non-Zero Balance (Rejected)
    r = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{account1_id}/close", headers=headers_u1_verified)
    print(f"\n5. POST /close (Non-Zero Balance $500): Status {r.status_code}")
    print(f"   Response: {r.text}")
    assert r.status_code in [400, 409, 500]

    # Create Zero-Balance Account for Closure Test
    r = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts", json={
        "accountType": "SAVINGS",
        "initialDeposit": 0.0
    }, headers=headers_u1_verified)
    account_zero = r.json()
    account_zero_id = account_zero.get("id")
    account_zero_num = account_zero.get("accountNumber")

    # 6. Closing Account with Zero Balance (Success)
    r = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{account_zero_id}/close", headers=headers_u1_verified)
    print(f"\n6. POST /close (Zero Balance): Status {r.status_code}")
    print(f"   Response Status: {r.json().get('status')}")
    assert r.status_code == 200
    assert r.json().get("status") == "CLOSED"

    # 7. Internal Debit Attempt Against CLOSED Account (Rejected)
    r = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/internal/{account_zero_num}/debit", json={
        "amount": 10.0
    })
    print(f"\n7. POST /internal/{account_zero_num}/debit against CLOSED Account: Status {r.status_code}")
    print(f"   Response: {r.text}")
    assert r.status_code in [400, 500]

    print("\n==================================================")
    print("  ALL STEP 19 LIVE ENDPOINT VERIFICATIONS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    time.sleep(3)
    test_step19_flow()
