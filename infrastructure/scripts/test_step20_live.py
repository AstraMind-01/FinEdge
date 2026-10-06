"""
Step 20 Transaction Service Live Verification Script
"""
import time
import requests
import json
from datetime import datetime, timedelta

AUTH_SERVICE_URL = "http://localhost:8081"
ACCOUNT_SERVICE_URL = "http://localhost:8082"
TRANSACTION_SERVICE_URL = "http://localhost:8083"

def test_step20_flow():
    print("\n==================================================")
    print("  Step 20 Transaction Service Live Endpoint Test   ")
    print("==================================================")

    # 1. Setup User & Accounts with Verified KYC
    username = f"step20_user_{int(time.time())}"
    password = "Password123!"

    r = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/register", json={
        "username": username,
        "email": f"{username}@finedge.io",
        "password": password
    })
    token_initial = r.json().get("accessToken")
    headers_initial = {"Authorization": f"Bearer {token_initial}"}

    # Complete KYC
    requests.post(f"{AUTH_SERVICE_URL}/api/v1/customers/kyc", json={
        "fullName": "Step Twenty User",
        "dateOfBirth": "1993-03-03",
        "phoneNumber": "9876543210",
        "address": "20 Limit Way, Financial District",
        "governmentIdType": "AADHAAR",
        "governmentIdNumber": "111122223333"
    }, headers=headers_initial)

    # Re-login to get JWT with kycStatus: VERIFIED
    r = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/login", json={
        "usernameOrEmail": username,
        "password": password
    })
    token = r.json().get("accessToken")
    headers = {"Authorization": f"Bearer {token}"}

    # Create Source Account (SAVINGS) & Destination Account (SAVINGS)
    r1 = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts", json={
        "accountType": "SAVINGS",
        "initialDeposit": 15000.0
    }, headers=headers)
    acc1_num = r1.json().get("accountNumber")

    r2 = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts", json={
        "accountType": "SAVINGS",
        "initialDeposit": 1000.0
    }, headers=headers)
    acc2_num = r2.json().get("accountNumber")

    print(f"Created Source SAVINGS Account #{acc1_num} ($15,000) & Dest Account #{acc2_num} ($1,000)")

    # 1. Normal Transfer Under Limits (Succeeds)
    r = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/transfer", json={
        "fromAccountNumber": acc1_num,
        "toAccountNumber": acc2_num,
        "amount": 1000.0,
        "idempotencyKey": f"idemp-normal-{int(time.time())}"
    }, headers=headers)
    print(f"\n1. Normal Transfer ($1,000 under limit): Status {r.status_code}")
    print(f"   Response: Status {r.json().get('status')}, Ref: {r.json().get('transactionRef')}")
    assert r.status_code == 201

    # 2. Transfer Rejected for Exceeding Per-Transaction Limit ($6,000 > $5,000 SAVINGS limit)
    r = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/transfer", json={
        "fromAccountNumber": acc1_num,
        "toAccountNumber": acc2_num,
        "amount": 6000.0,
        "idempotencyKey": f"idemp-over-tx-limit-{int(time.time())}"
    }, headers=headers)
    print(f"\n2. Transfer Exceeding Per-Transaction Limit ($6,000 > $5,000 cap): Status {r.status_code}")
    print(f"   Response: {r.text}")
    assert r.status_code == 403
    assert "LIMIT_EXCEEDED" in r.text or "Per-transaction limit exceeded" in r.text

    # 3. Transfer Rejected for Exceeding Daily Cumulative Limit ($10,000 SAVINGS cap)
    # Usage so far today: $1,000. Next transfer: $4,500 (total $5,500 <= $10,000 -> succeeds)
    r = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/transfer", json={
        "fromAccountNumber": acc1_num,
        "toAccountNumber": acc2_num,
        "amount": 4500.0,
        "idempotencyKey": f"idemp-cum-1-{int(time.time())}"
    }, headers=headers)
    assert r.status_code == 201
    print(f"\n3a. Cumulative Transfer #2 ($4,500, total usage $5,500): Status {r.status_code} (SUCCESS)")

    # Attempt another transfer of $4,900 (total usage would be $10,400 > $10,000 -> rejected)
    r = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/transfer", json={
        "fromAccountNumber": acc1_num,
        "toAccountNumber": acc2_num,
        "amount": 4900.0,
        "idempotencyKey": f"idemp-cum-2-{int(time.time())}"
    }, headers=headers)
    print(f"3b. Transfer Exceeding Daily Cumulative Limit ($10,400 total > $10,000 cap): Status {r.status_code}")
    print(f"    Response: {r.text}")
    assert r.status_code == 403
    assert "LIMIT_EXCEEDED" in r.text or "Daily cumulative limit exceeded" in r.text

    # 4. Scheduled Transfer (Executes when due)
    scheduled_time = (datetime.now() + timedelta(seconds=1)).strftime("%Y-%m-%dT%H:%M:%S")
    r = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/scheduled", json={
        "fromAccountNumber": acc1_num,
        "toAccountNumber": acc2_num,
        "amount": 200.0,
        "description": "Live Scheduled Transfer Test",
        "scheduledAt": scheduled_time
    }, headers=headers)
    sched_resp = r.json()
    sched_id = sched_resp.get("id")
    print(f"\n4a. POST /transactions/scheduled (ID #{sched_id}, ScheduledAt: {scheduled_time}): Status {r.status_code}")

    print("    Waiting 6 seconds for ScheduledTransferPoller to execute...")
    time.sleep(6)

    r = requests.get(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/scheduled", headers=headers)
    scheduled_list = r.json()
    executed_st = next((s for s in scheduled_list if s.get("id") == sched_id), None)
    print(f"4b. Scheduled Transfer ID #{sched_id} Status after poller: {executed_st.get('status')}")
    assert executed_st.get("status") == "COMPLETED"

    # 5. Recurring Transfer (Produces multiple occurrences)
    start_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    r = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/recurring", json={
        "fromAccountNumber": acc1_num,
        "toAccountNumber": acc2_num,
        "amount": 50.0,
        "description": "Live Recurring Transfer Test",
        "frequency": "DAILY",
        "startDate": start_time,
        "maxOccurrences": 3
    }, headers=headers)
    rule_id = r.json().get("id")
    print(f"\n5a. POST /transactions/recurring (Rule ID #{rule_id}, Max Occurrences: 3): Status {r.status_code}")

    print("    Waiting 4 seconds for poller occurrence processing...")
    time.sleep(4)

    r = requests.get(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/recurring", headers=headers)
    rule_list = r.json()
    active_rule = next((ru for ru in rule_list if ru.get("id") == rule_id), None)
    print(f"5b. Recurring Rule ID #{rule_id} Status: {active_rule.get('status')}, Completed Occurrences: {active_rule.get('completedOccurrences')}")
    assert active_rule.get("completedOccurrences") >= 1

    print("\n==================================================")
    print("  ALL STEP 20 LIVE ENDPOINT VERIFICATIONS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    time.sleep(3)
    test_step20_flow()
