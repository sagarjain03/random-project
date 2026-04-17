from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_m4_endpoints():
    print("--- Testing GET /api/nudge/queue ---")
    res = client.get("/api/nudge/queue")
    print(f"Status Code: {res.status_code}")
    data = res.json()
    print("Response:")
    import json
    print(json.dumps(data, indent=2))
    
    if res.status_code == 200 and data.get("data"):
        partner_id = data["data"][0]["partner_id"]
        print(f"\n--- Testing POST /api/nudge/send for partner {partner_id} ---")
        send_res = client.post("/api/nudge/send", json={"partner_id": partner_id})
        print(f"Status Code: {send_res.status_code}")
        print("Response:")
        print(json.dumps(send_res.json(), indent=2))
    else:
        print("\nNo nudges found in queue to test /api/nudge/send.")

if __name__ == "__main__":
    test_m4_endpoints()
