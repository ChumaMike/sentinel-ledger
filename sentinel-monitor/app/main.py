from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Transaction(BaseModel):
    from_id: int
    to_id: int
    amount: float

@app.post("/v1/scrutinize")
async def scrutinize_transaction(tx: Transaction):
    print(f"DEBUG: Sentinel analyzing transaction: {tx}")

    # Enterprise Rule: Anything over R10,000 is flagged
    if tx.amount > 10000:
        return {
            "decision": "FLAGGED",
            "reason": "Transaction exceeds standard risk threshold",
            "risk_score": 85
        }

    # Returning "APPROVED" to match Java logic
    return {
        "decision": "APPROVED",
        "reason": "Within safe limits",
        "risk_score": 10
    }