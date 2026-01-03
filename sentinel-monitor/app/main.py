from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Transaction(BaseModel):
    from_id: int
    to_id: int
    amount: float

@app.post("/v1/scrutinize")
async def scrutinize_transaction(tx: Transaction):
    print(f"DEBUG: Sentinel received request: {tx}")
    # Logic: Deny any transfer over R10,000 as "Suspicious"
    if tx.amount > 10000:
        return {"decision": "DENY", "reason": "High-value transaction requires manual review"}

    return {"decision": "ALLOW", "reason": "Transaction within safe limits"}