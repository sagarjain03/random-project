import requests
import json

BASE = "http://localhost:8000"

print("\n=== M0: PING ===")
r = requests.get(f"{BASE}/api/ping")
print(r.json())
assert r.json() == {"data": {"status": "ok"}, "error": None}, "FAIL: ping"
print("PASS")

print("\n=== M1: GET LEADS ===")
r = requests.get(f"{BASE}/api/leads")
data = r.json()
print(f"Total leads: {len(data['data'])}")
assert data["error"] is None, "FAIL: get leads"
assert len(data["data"]) > 0, "FAIL: no leads in DB"
lead_id = data["data"][0]["id"]
lead_name = data["data"][0]["name"]
print(f"First lead: {lead_name} (id: {lead_id})")
# Verify shape
first = data["data"][0]
assert "id" in first, "FAIL: missing id"
assert "name" in first, "FAIL: missing name"
assert "industry" in first, "FAIL: missing industry"
assert "score" in first, "FAIL: missing score"
assert "signals" in first, "FAIL: missing signals"
assert isinstance(first["score"], int), "FAIL: score not int"
# Verify sorted descending
scores = [l["score"] for l in data["data"]]
assert scores == sorted(scores, reverse=True), "FAIL: leads not sorted by score desc"
print("PASS")

print("\n=== M1: SCORE LEADS ===")
r = requests.post(f"{BASE}/api/leads/score")
data = r.json()
print(f"Score response: {data}")
assert data["error"] is None, f"FAIL: score leads — {data['error']}"
assert "leads_scored" in data["data"], "FAIL: missing leads_scored"
print("PASS")

print("\n=== M2: MISSING lead_id ===")
r = requests.post(f"{BASE}/api/outreach/generate", json={})
data = r.json()
print(data)
assert data["data"] is None, "FAIL: should return null data"
assert data["error"] == "lead_id is required", f"FAIL: wrong error: {data['error']}"
print("PASS")

print("\n=== M2: INVALID lead_id ===")
r = requests.post(f"{BASE}/api/outreach/generate", json={"lead_id": "nonexistent-id-xyz"})
data = r.json()
print(data)
assert data["data"] is None, "FAIL: should return null data"
assert "not found" in data["error"], f"FAIL: wrong error: {data['error']}"
print("PASS")

# Get a fresh lead_id from GET /leads after scoring
r = requests.get(f"{BASE}/api/leads")
data = r.json()
lead_id = data["data"][0]["id"]
lead_name = data["data"][0]["name"]

print(f"\n=== M2: GENERATE OUTREACH (lead: {lead_name}) ===")
r = requests.post(
    f"{BASE}/api/outreach/generate",
    json={"lead_id": lead_id}
)
data = r.json()
print(f"Error: {data['error']}")
if data["data"]:
    cto = data["data"]["cto_draft"][:120]
    print(f"CTO draft preview: {cto}")
    assert "{company_name}" not in data["data"]["cto_draft"], "FAIL: placeholder not replaced in cto_draft"
    assert "{company_name}" not in data["data"]["cfo_draft"], "FAIL: placeholder not replaced in cfo_draft"
    assert "{company_name}" not in data["data"]["user_draft"], "FAIL: placeholder not replaced in user_draft"
    assert "cto_draft" in data["data"], "FAIL: missing cto_draft field"
    assert "cfo_draft" in data["data"], "FAIL: missing cfo_draft field"
    assert "user_draft" in data["data"], "FAIL: missing user_draft field"
    print("PASS")
else:
    print(f"FAIL: {data['error']}")

print("\n=== M3: COMPLIANCE CHECK ===")
r = requests.post(
    f"{BASE}/api/compliance/check",
    json={"draft": "Our platform guarantees 99.9% uptime and has achieved 47% cost reduction for all customers."}
)
data = r.json()
print(f"Status code: {r.status_code}")
print(f"Error: {data['error']}")
if data["data"]:
    print(f"Status: {data['data']['status']}")
    print(f"Flags: {len(data['data']['flags'])}")
    assert "status" in data["data"], "FAIL: missing status field"
    assert "flags" in data["data"], "FAIL: missing flags field"
    if data["data"]["flags"]:
        flag = data["data"]["flags"][0]
        assert "sentence" in flag, "FAIL: missing sentence field"
        assert "rule" in flag, "FAIL: missing rule field"
        assert "rewrite" in flag, "FAIL: missing rewrite field"
        print(f"First flag sentence: {flag['sentence'][:80]}")
    print("PASS")
else:
    print(f"FAIL: {data['error']}")

print("\n=== M3: MISSING draft ===")
r = requests.post(f"{BASE}/api/compliance/check", json={"draft": ""})
data = r.json()
print(data)
assert data["data"] is None
assert data["error"] == "draft is required"
print("PASS")

print("\n=== ALL TESTS DONE ===")
