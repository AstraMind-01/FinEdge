import requests

login_resp = requests.post("http://localhost:8080/api/v1/auth/login", json={
    "usernameOrEmail": "admin_demo_user",
    "password": "Password123!"
})
token = login_resp.json().get("accessToken")

r = requests.get("http://localhost:8080/api/v1/notifications", headers={"Authorization": f"Bearer {token}"})
print("Notifications Status Code:", r.status_code)
print("Notifications Count:", len(r.json()))
for notif in r.json():
    print(f" - [{notif['type']}] Ref: {notif['transactionRef']} | Msg: {notif['message']}")

assert r.status_code == 200
assert len(r.json()) > 0
print("\n>>> NOTIFICATIONS VERIFIED 100%! <<<")
