import sys
import uuid
import time
import requests

GATEWAY_URL = "http://localhost:8080"

def log_step(step_num, message):
    print(f"\n==================================================")
    print(f" STEP {step_num}: {message}")
    print(f"==================================================")

def assert_correlation_id(response, expected_cid, context_msg):
    cid_header = response.headers.get("X-Correlation-ID", "")
    assert expected_cid in cid_header, f"{context_msg}: expected correlation ID '{expected_cid}' to be present in header '{cid_header}'"

def run_tests():
    # Generate unique usernames to avoid collision
    user1 = f"alice_{uuid.uuid4().hex[:6]}"
    email1 = f"{user1}@example.com"
    pass1 = "SecretPassword123!"

    user2 = f"bob_{uuid.uuid4().hex[:6]}"
    email2 = f"{user2}@example.com"
    pass2 = "SecretPassword123!"

    correlation_id = f"corr-id-{uuid.uuid4().hex[:8]}"
    headers_base = {
        "X-Correlation-ID": correlation_id
    }

    # 1. Registration & Login (Auth Service)
    log_step(1, "Register and Login User 1")
    reg_payload = {
        "username": user1,
        "email": email1,
        "password": pass1
    }
    
    try:
        r_reg = requests.post(f"{GATEWAY_URL}/api/v1/auth/register", json=reg_payload, headers=headers_base)
    except requests.exceptions.ConnectionError:
        print(f"ERROR: Could not connect to API Gateway at {GATEWAY_URL}.")
        print("Please ensure all backend microservices are running before executing this integration test.")
        sys.exit(1)

    print(f"Register status: {r_reg.status_code}")
    assert r_reg.status_code == 201 or r_reg.status_code == 200, f"Registration failed: {r_reg.text}"
    assert_correlation_id(r_reg, correlation_id, "Registration response")
    print("User 1 registered successfully.")

    login_payload = {
        "usernameOrEmail": user1,
        "password": pass1
    }
    r_login = requests.post(f"{GATEWAY_URL}/api/v1/auth/login", json=login_payload, headers=headers_base)
    print(f"Login status: {r_login.status_code}")
    assert r_login.status_code == 200, f"Login failed: {r_login.text}"
    token1 = r_login.json().get("accessToken")
    assert token1 is not None, "Login did not return access token"
    assert_correlation_id(r_login, correlation_id, "Login response")
    print("User 1 logged in successfully. Token acquired.")

    headers_user1 = {
        "Authorization": f"Bearer {token1}",
        "X-Correlation-ID": correlation_id
    }

    # 2. Create Account (Account Service)
    log_step(2, "Create Bank Account for User 1")
    acc_payload = {
        "accountType": "SAVINGS",
        "initialBalance": 1000.00
    }
    r_acc = requests.post(f"{GATEWAY_URL}/api/v1/accounts", json=acc_payload, headers=headers_user1)
    print(f"Create Account status: {r_acc.status_code}")
    assert r_acc.status_code == 201 or r_acc.status_code == 200, f"Account creation failed: {r_acc.text}"
    account_number1 = r_acc.json().get("accountNumber")
    account_id1 = r_acc.json().get("id")
    assert account_number1 is not None, "No account number returned"
    assert account_id1 is not None, "No account ID returned"
    assert_correlation_id(r_acc, correlation_id, "Account creation response")
    print(f"Account created successfully: {account_number1} (ID: {account_id1})")

    # 3. Low-Risk Deposit success (Transaction Service)
    log_step(3, "Execute Low-Risk Deposit (50.00)")
    idemp_key1 = str(uuid.uuid4())
    dep_payload = {
        "toAccountNumber": account_number1,
        "amount": 50.00,
        "idempotencyKey": idemp_key1
    }
    r_dep = requests.post(f"{GATEWAY_URL}/api/v1/transactions/deposit", json=dep_payload, headers=headers_user1)
    print(f"Deposit status: {r_dep.status_code}")
    assert r_dep.status_code == 200 or r_dep.status_code == 201, f"Low risk deposit failed: {r_dep.text}"
    assert_correlation_id(r_dep, correlation_id, "Low-risk deposit response")
    print("Deposit succeeded.")

    # 4. High-Risk Deposit block (Transaction Service)
    log_step(4, "Attempt High-Risk Deposit (15,000.00) - Should be blocked")
    idemp_key2 = str(uuid.uuid4())
    high_risk_payload = {
        "toAccountNumber": account_number1,
        "amount": 15000.00,
        "idempotencyKey": idemp_key2
    }
    r_high = requests.post(f"{GATEWAY_URL}/api/v1/transactions/deposit", json=high_risk_payload, headers=headers_user1)
    print(f"High risk status: {r_high.status_code}")
    print(f"High risk response message: {r_high.text}")
    # High risk transactions are blocked by Fraud Service and should return 400 Bad Request or 403 Forbidden
    assert r_high.status_code in [400, 403], f"Expected 400 or 403 for blocked transaction, got: {r_high.status_code}"
    assert_correlation_id(r_high, correlation_id, "High-risk block response")
    print("High risk transaction successfully blocked by fraud detection engine.")

    # 5. Idempotency 409 conflict (Transaction Service)
    log_step(5, "Test Idempotency Key Reuse Conflict (409)")
    # Send same idempotency key with DIFFERENT amount
    conflict_payload = {
        "toAccountNumber": account_number1,
        "amount": 120.00,
        "idempotencyKey": idemp_key1
    }
    r_conf = requests.post(f"{GATEWAY_URL}/api/v1/transactions/deposit", json=conflict_payload, headers=headers_user1)
    print(f"Conflict response status: {r_conf.status_code}")
    print(f"Conflict response text: {r_conf.text}")
    assert r_conf.status_code == 409, f"Expected 409 conflict, got: {r_conf.status_code}"
    assert_correlation_id(r_conf, correlation_id, "Idempotency conflict response")
    print("Idempotency conflict successfully detected (409).")

    # 6. Cross-User Access Denial (Account Service)
    log_step(6, "Test Cross-User Account Access Denial (403)")
    # Register and login User 2
    r_reg2 = requests.post(f"{GATEWAY_URL}/api/v1/auth/register", json={
        "username": user2,
        "email": email2,
        "password": pass2
    }, headers=headers_base)
    assert r_reg2.status_code in [200, 201]

    r_login2 = requests.post(f"{GATEWAY_URL}/api/v1/auth/login", json={
        "usernameOrEmail": user2,
        "password": pass2
    }, headers=headers_base)
    token2 = r_login2.json().get("accessToken")
    
    headers_user2 = {
        "Authorization": f"Bearer {token2}",
        "X-Correlation-ID": correlation_id
    }

    # Attempt to view User 1's account details using User 2's token
    r_lookup = requests.get(f"{GATEWAY_URL}/api/v1/accounts/{account_id1}", headers=headers_user2)
    print(f"Cross-user account view status: {r_lookup.status_code}")
    assert r_lookup.status_code == 403, f"Expected 403 Forbidden, got: {r_lookup.status_code}"
    assert_correlation_id(r_lookup, correlation_id, "Cross-user lookup response")
    print("Cross-user access denial successfully verified.")

    # 7. Correlation ID Propagation verification
    log_step(7, "Correlation ID Propagation Summary")
    print(f"Successfully validated correlation ID '{correlation_id}' across all API flows:")
    print(" - /auth/register -> Propagated")
    print(" - /auth/login -> Propagated")
    print(" - /accounts (POST) -> Propagated")
    print(" - /transactions/deposit (POST) -> Propagated")
    print(" - /transactions/deposit (POST - Blocked) -> Propagated")
    print(" - /transactions/deposit (POST - 409 Conflict) -> Propagated")
    print(" - /accounts/{id} (GET - 403 Denied) -> Propagated")

    print("\n==================================================")
    print(" INTEGRATION TEST SUCCESSFUL!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
