from fastapi.testclient import TestClient
from app.main import app  # Assuming your file is app/main.py

client = TestClient(app)

def test_sentinel_status():
    """Ensure the Sentinel AI is online"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "Sentinel AI Online", "version": "2.0-RETAIL"}

def test_block_high_value_transaction():
    """Rule 1: Block any transaction > R10,000"""
    payload = {
        "amount": 15000.00,
        "from_account": "1001",
        "to_account": "2002"
    }
    response = client.post("/v1/scrutinize", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "BLOCKED"
    assert "exceeds R10,000" in data["reason"]

def test_approve_normal_transaction():
    """Rule 2: Approve buying a coffee"""
    payload = {
        "amount": 50.00,
        "from_account": "1001",
        "to_account": "2002"
    }
    response = client.post("/v1/scrutinize", json=payload)

    assert response.status_code == 200
    assert response.json()["decision"] == "APPROVED"