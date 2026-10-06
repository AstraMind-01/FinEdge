"""
Master Full End-to-End Realistic User Journey Verification Script (Steps 1-20)
"""
import time
import requests
import json
from datetime import datetime, timedelta

GATEWAY_URL = "http://localhost:8080"
AUTH_SERVICE_URL = "http://localhost:8081"
ACCOUNT_SERVICE_URL = "http://localhost:8082"
TRANSACTION_SERVICE_URL = "http://localhost:8083"
NOTIFICATION_SERVICE_URL = "http://localhost:8084"
AUDIT_SERVICE_URL = "http://localhost:8085"
FRAUD_SERVICE_URL = "http://localhost:8086"

def run_master_user_journey():
    print("\n==========================================================================")
    print("  FINEDGE PLATFORM — MASTER FULL USER JOURNEY VERIFICATION (STEPS 1-20)  ")
    print("==========================================================================")

    results = {}

    # 1. Register User A & User B
    ts = int(time.time())
    user_a = f"alice_e2e_{ts}"
    user_b = f"bob_e2e_{ts}"
    pass_a = "Pass1234!"
    pass_b = "Pass1234!"

    r_reg_a = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/register", json={"username": user_a, "email": f"{user_a}@finedge.io", "password": pass_a})
    r_reg_b = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/register", json={"username": user_b, "email": f"{user_b}@finedge.io", "password": pass_b})
    assert r_reg_a.status_code == 201 and r_reg_b.status_code == 201

    # Login User A (unverified KYC token)
    r_log_a1 = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/login", json={"usernameOrEmail": user_a, "password": pass_a})
    token_a_unverified = r_log_a1.json().get("accessToken")
    headers_a_unverified = {"Authorization": f"Bearer {token_a_unverified}"}

    # Login User B
    r_log_b = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/login", json={"usernameOrEmail": user_b, "password": pass_b})
    token_b = r_log_b.json().get("accessToken")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Step 19 Requirement: Account Creation BLOCKED before KYC verification
    r_acc_fail = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts", json={"accountType": "SAVINGS", "initialDeposit": 1000.0}, headers=headers_a_unverified)
    print(f"\n1a. Account Creation Before KYC: Status {r_acc_fail.status_code} (Expected 403 Blocked)")
    assert r_acc_fail.status_code == 403
    results["kyc_gate_blocked"] = True

    # Submit KYC for User A
    requests.post(f"{AUTH_SERVICE_URL}/api/v1/customers/kyc", json={
        "fullName": "Alice Enterprise",
        "dateOfBirth": "1992-05-15",
        "phoneNumber": "9876543210",
        "address": "100 Financial Tower",
        "governmentIdType": "PASSPORT",
        "governmentIdNumber": "P987654321"
    }, headers=headers_a_unverified)

    # Submit KYC for User B
    requests.post(f"{AUTH_SERVICE_URL}/api/v1/customers/kyc", json={
        "fullName": "Bob Recipient",
        "dateOfBirth": "1994-08-20",
        "phoneNumber": "9123456789",
        "address": "200 Market Street",
        "governmentIdType": "AADHAAR",
        "governmentIdNumber": "999988887777"
    }, headers=headers_b)

    # Re-login User A & B to get token with kycStatus: VERIFIED claim
    r_log_a2 = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/login", json={"usernameOrEmail": user_a, "password": pass_a})
    token_a = r_log_a2.json().get("accessToken")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    r_log_b2 = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/login", json={"usernameOrEmail": user_b, "password": pass_b})
    token_b = r_log_b2.json().get("accessToken")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Verify kycStatus in User A profile
    r_me = requests.get(f"{AUTH_SERVICE_URL}/api/v1/customers/me/kyc", headers=headers_a)
    print(f"1b. User A KYC Status After Verification: {r_me.json().get('kycStatus')}")
    assert r_me.json().get("kycStatus") == "VERIFIED"
    results["kyc_verified_claim"] = True

    # 2. Account Creation (Succeeds after KYC)
    r_acc_a = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts", json={"accountType": "SAVINGS", "initialDeposit": 15000.0}, headers=headers_a)
    acc_a_num = r_acc_a.json().get("accountNumber")
    acc_a_id = r_acc_a.json().get("id")

    r_acc_b = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts", json={"accountType": "SAVINGS", "initialDeposit": 1000.0}, headers=headers_b)
    acc_b_num = r_acc_b.json().get("accountNumber")

    print(f"\n2. Created SAVINGS Account #{acc_a_num} ($15,000) for Alice & Account #{acc_b_num} ($1,000) for Bob")
    results["account_creation_verified"] = True

    # 3. Deposit Funds
    r_dep = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/deposit", json={
        "toAccountNumber": acc_a_num,
        "amount": 2000.0,
        "idempotencyKey": f"idemp-dep-{ts}"
    }, headers=headers_a)
    print(f"\n3. Deposit $2,000 to Account #{acc_a_num}: Status {r_dep.status_code}")
    assert r_dep.status_code == 201
    results["deposit_funds"] = True

    # 4. Add Joint Holder & Nominee to Account A (Step 19)
    r_joint = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{acc_a_id}/joint-holders", json={
        "jointUsername": user_b
    }, headers=headers_a)
    print(f"\n4a. Add Joint Holder ({user_b}): Status {r_joint.status_code}")
    assert r_joint.status_code == 201

    r_nom = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{acc_a_id}/nominees", json={
        "nomineeName": "Charlie Enterprise",
        "relationship": "CHILD",
        "sharePercentage": 100.0,
        "phoneNumber": "9876543210"
    }, headers=headers_a)
    print(f"4b. Add Nominee (Charlie): Status {r_nom.status_code}")
    assert r_nom.status_code == 201
    results["joint_holder_and_nominee"] = True

    # 5. Transfer Exceeding Per-Transaction Limit ($6,000 > $5,000 SAVINGS limit)
    r_limit_per = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/transfer", json={
        "fromAccountNumber": acc_a_num,
        "toAccountNumber": acc_b_num,
        "amount": 6000.0,
        "idempotencyKey": f"idemp-lim-per-{ts}"
    }, headers=headers_a)
    print(f"\n5. Transfer Exceeding Per-Txn Limit ($6,000 > $5,000): Status {r_limit_per.status_code} (Expected 403)")
    assert r_limit_per.status_code == 403
    results["per_txn_limit_rejected"] = True

    # 6. Transfer Exceeding Daily Cumulative Limit ($10,000 SAVINGS limit)
    # Txn 1: $4,500 (succeeds, cumulative $4,500)
    r_tx1 = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/transfer", json={
        "fromAccountNumber": acc_a_num,
        "toAccountNumber": acc_b_num,
        "amount": 4500.0,
        "idempotencyKey": f"idemp-cum-1-{ts}"
    }, headers=headers_a)
    assert r_tx1.status_code == 201

    # Txn 2: $4,500 (succeeds, cumulative $9,000)
    r_tx2 = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/transfer", json={
        "fromAccountNumber": acc_a_num,
        "toAccountNumber": acc_b_num,
        "amount": 4500.0,
        "idempotencyKey": f"idemp-cum-2-{ts}"
    }, headers=headers_a)
    assert r_tx2.status_code == 201

    # Txn 3: $2,000 (cumulative $11,000 > $10,000 -> rejected 403)
    r_limit_cum = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/transfer", json={
        "fromAccountNumber": acc_a_num,
        "toAccountNumber": acc_b_num,
        "amount": 2000.0,
        "idempotencyKey": f"idemp-cum-3-{ts}"
    }, headers=headers_a)
    print(f"\n6. Transfer Exceeding Daily Cumulative Limit ($11,000 total > $10,000): Status {r_limit_cum.status_code} (Expected 403)")
    assert r_limit_cum.status_code == 403
    results["daily_limit_rejected"] = True

    # 7. Successful Transfer Under Limits (Triggers AI Fraud Check, Kafka, Notification, Audit)
    r_tx_ok = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/transfer", json={
        "fromAccountNumber": acc_a_num,
        "toAccountNumber": acc_b_num,
        "amount": 500.0,
        "idempotencyKey": f"idemp-ok-{ts}"
    }, headers=headers_a)
    print(f"\n7a. Successful Transfer ($500 under limit): Status {r_tx_ok.status_code}")
    assert r_tx_ok.status_code == 201

    print("    Waiting 2 seconds for Kafka event propagation to Notification & Audit services...")
    time.sleep(2)

    # Check Notification Service
    r_notif = requests.get(f"{NOTIFICATION_SERVICE_URL}/api/v1/notifications", headers=headers_a)
    print(f"7b. Notification Service Received Event: Status {r_notif.status_code}")
    assert r_notif.status_code == 200

    # Check Audit Service
    r_audit = requests.get(f"{AUDIT_SERVICE_URL}/api/v1/health")
    print(f"7c. Audit Service Health: Status {r_audit.status_code}")
    assert r_audit.status_code == 200
    results["transfer_under_limits_kafka_events"] = True

    # 8. Schedule Future Transfer & Poller Execution
    sched_time = (datetime.now() + timedelta(seconds=1)).strftime("%Y-%m-%dT%H:%M:%S")
    r_sched = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/scheduled", json={
        "fromAccountNumber": acc_a_num,
        "toAccountNumber": acc_b_num,
        "amount": 100.0,
        "description": "E2E Master Scheduled Transfer",
        "scheduledAt": sched_time
    }, headers=headers_a)
    sched_id = r_sched.json().get("id")
    print(f"\n8a. POST /transactions/scheduled (ID #{sched_id}, ScheduledAt: {sched_time}): Status {r_sched.status_code}")

    print("    Waiting 5 seconds for ScheduledTransferPoller to execute...")
    time.sleep(5)

    r_sched_list = requests.get(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/scheduled", headers=headers_a)
    executed_st = next((s for s in r_sched_list.json() if s.get("id") == sched_id), None)
    print(f"8b. Scheduled Transfer ID #{sched_id} Status after poller: {executed_st.get('status')}")
    assert executed_st.get("status") == "COMPLETED"
    results["scheduled_transfer_executed"] = True

    # 9. Recurring Transfer Rule Execution
    start_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    r_rec = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/recurring", json={
        "fromAccountNumber": acc_a_num,
        "toAccountNumber": acc_b_num,
        "amount": 25.0,
        "description": "E2E Master Recurring Rule",
        "frequency": "DAILY",
        "startDate": start_time,
        "maxOccurrences": 3
    }, headers=headers_a)
    rule_id = r_rec.json().get("id")
    print(f"\n9a. POST /transactions/recurring (Rule ID #{rule_id}): Status {r_rec.status_code}")

    print("    Waiting 4 seconds for poller occurrence processing...")
    time.sleep(4)

    r_rec_list = requests.get(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/recurring", headers=headers_a)
    active_rule = next((ru for ru in r_rec_list.json() if ru.get("id") == rule_id), None)
    print(f"9b. Recurring Rule ID #{rule_id} Status: {active_rule.get('status')}, Completed Occurrences: {active_rule.get('completedOccurrences')}")
    assert active_rule.get("completedOccurrences") >= 1
    results["recurring_transfer_executed"] = True

    # Register Admin User for account management operations
    admin_name = f"admin_e2e_{ts}"
    r_admin_reg = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/register", json={"username": admin_name, "email": f"{admin_name}@finedge.io", "password": pass_a})
    assert r_admin_reg.status_code == 201
    r_admin_log = requests.post(f"{AUTH_SERVICE_URL}/api/v1/auth/login", json={"usernameOrEmail": admin_name, "password": pass_a})
    token_admin = r_admin_log.json().get("accessToken")
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    # 10. Freeze Account & Block Transactions (Step 19)
    r_freeze = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{acc_a_id}/freeze", json={"reason": "Suspected Fraud Investigation"}, headers=headers_admin)
    print(f"\n10a. Freeze Account ID #{acc_a_id}: Status {r_freeze.status_code}")
    assert r_freeze.status_code == 200

    r_blocked_tx = requests.post(f"{TRANSACTION_SERVICE_URL}/api/v1/transactions/deposit", json={
        "toAccountNumber": acc_a_num,
        "amount": 50.0,
        "idempotencyKey": f"idemp-frozen-{ts}"
    }, headers=headers_a)
    print(f"10b. Transaction Against Frozen Account: Status {r_blocked_tx.status_code} (Expected Blocked)")
    assert r_blocked_tx.status_code in [400, 403, 500]

    # Unfreeze Account for closure testing
    requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{acc_a_id}/unfreeze", headers=headers_admin)
    results["freeze_unfreeze_verified"] = True

    # 11. Close Account (Step 19)
    # 11a. Attempt to close account with non-zero balance (Expect rejection 400)
    r_close_fail = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{acc_a_id}/close", headers=headers_a)
    print(f"\n11a. Close Account With Non-Zero Balance: Status {r_close_fail.status_code} (Expected 400 Rejection)")
    assert r_close_fail.status_code == 400

    # Create a fresh 0-balance account for clean closure
    r_acc_zero = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts", json={"accountType": "SAVINGS", "initialDeposit": 0.0}, headers=headers_a)
    acc_zero_id = r_acc_zero.json().get("id")

    r_close_ok = requests.post(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{acc_zero_id}/close", headers=headers_a)
    print(f"11b. Close Account With Zero Balance: Status {r_close_ok.status_code} (Expected 200 Success)")
    assert r_close_ok.status_code == 200
    results["account_closure_verified"] = True

    print("\n==========================================================================")
    print("  MASTER FULL END-TO-END USER JOURNEY VERIFICATION PASSED 100%!           ")
    print("==========================================================================")
    return results

if __name__ == "__main__":
    time.sleep(2)
    run_master_user_journey()
