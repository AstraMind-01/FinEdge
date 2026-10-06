import requests

r = requests.get("http://localhost:8080/api/v1/fraud/health")
print("API Gateway -> Fraud Detection Service Status Code:", r.status_code)
print("Response Payload:", r.json())

assert r.status_code == 200
assert r.json().get("status") == "UP"
print("\n>>> GATEWAY FRAUD DETECTION ROUTE VERIFIED 100%! <<<")
