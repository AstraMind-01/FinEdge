"""
Step 18 KYC Simulation End-to-End Live Verification Script
"""
import time
import requests
import json
import base64

AUTH_SERVICE_URL = "http://localhost:8081"

def decode_jwt_payload(token):
    parts = token.split(".")
    if len(parts) != 3:
        return {}
    padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
    decoded_bytes = base64.b64decode(padded)
    return json.loads(decoded_bytes)

def test_kyc_flow():
    print("\n==================================================")
    print("  Step 18 KYC Simulation Live Endpoint Test       ")
    print("==================================================")

    # 1. Register User 1 (Valid KYC Candidate)
    username_valid = f"kyc_user_{int(time.time())}"
    email_valid = f"{username_valid}@finedge.io"
    password = "Password123!"

    r = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/register", json={
        "username": username_valid,
        "email": email_valid,
        "password": password
    })
    print(f"\n1. Register User ({username_valid}): {r.status_code}")
    token_valid = r.json().get("accessToken")

    # Initial JWT Claims Check
    claims = decode_jwt_payload(token_valid)
    print(f"   Decoded Initial JWT Claims: {json.dumps(claims)}")
    assert claims.get("kycStatus") == "NOT_SUBMITTED"

    # 2. Check Initial KYC Status
    headers_valid = {"Authorization": f"Bearer {token_valid}"}
    r = requests.get(f"{AUTH_SERVICE_URL}/api/v1/customers/me/kyc", headers=headers_valid)
    print(f"\n2. GET /me/kyc (Initial Status): Status {r.status_code}")
    print(f"   Response: {json.dumps(r.json(), indent=2)}")
    assert r.json().get("kycStatus") == "NOT_SUBMITTED"

    # 3. Submit Valid KYC
    kyc_payload_valid = {
        "fullName": "Aarav Sharma",
        "dateOfBirth": "1994-06-25",
        "phoneNumber": "9876543210",
        "address": "12 Ring Road, Bengaluru, India",
        "governmentIdType": "AADHAAR",
        "governmentIdNumber": "123456789012"
    }
    r = requests.post(f"{AUTH_SERVICE_URL}/api/v1/customers/kyc", json=kyc_payload_valid, headers=headers_valid)
    print(f"\n3. POST /kyc (Valid Details): Status {r.status_code}")
    print(f"   Response: {json.dumps(r.json(), indent=2)}")
    assert r.json().get("kycStatus") == "VERIFIED"

    # Re-login to get updated JWT with kycStatus: VERIFIED
    r = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/login", json={
        "usernameOrEmail": username_valid,
        "password": password
    })
    token_verified = r.json().get("accessToken")
    claims_verified = decode_jwt_payload(token_verified)
    print(f"\n4. Post-KYC Login JWT Claims: {json.dumps(claims_verified)}")
    assert claims_verified.get("kycStatus") == "VERIFIED"

    # 5. Register User 2 (Rejection Test Candidate)
    username_reject = f"kyc_reject_{int(time.time())}"
    r = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/register", json={
        "username": username_reject,
        "email": f"{username_reject}@finedge.io",
        "password": password
    })
    token_reject = r.json().get("accessToken")
    headers_reject = {"Authorization": f"Bearer {token_reject}"}

    # Submit Rejected KYC (ID number '0000000000')
    kyc_payload_reject = {
        "fullName": "Fake User",
        "dateOfBirth": "1990-01-01",
        "phoneNumber": "9999999999",
        "address": "000 Unknown Street",
        "governmentIdType": "PAN",
        "governmentIdNumber": "0000000000"
    }
    r = requests.post(f"{AUTH_SERVICE_URL}/api/v1/customers/kyc", json=kyc_payload_reject, headers=headers_reject)
    print(f"\n5. POST /kyc (Deterministic Rejection Test ID '0000000000'): Status {r.status_code}")
    print(f"   Response: {json.dumps(r.json(), indent=2)}")
    assert r.json().get("kycStatus") == "REJECTED"

    print("\n==================================================")
    print("  ALL STEP 18 KYC LIVE ENDPOINT VERIFICATIONS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_kyc_flow()
