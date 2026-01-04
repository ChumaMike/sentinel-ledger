🛡️ Sentinel Ledger: Distributed Banking & Fraud Monitor
This project is a high-security banking simulation. It uses a Java Spring Boot core for accounting, a PostgreSQL database for the safe, and a Python FastAPI Sentinel to monitor and block fraudulent transactions.

🚀 Quick Start: The "Launch Sequence"
Follow these steps in order to start the entire system. Open four separate terminal tabs.

1. The Database (PostgreSQL)
   Start the "Safe" where all account balances are stored.
```bash
sudo docker-compose down -v  # Clean start
sudo docker-compose up
```

2. The Sentinel (Python)
   Start the Security Guard that watches for fraud.
```bash
# Make sure uvicorn and fastapi are installed
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000
```

3. The Core Engine (Java)
   Start the banking logic that handles transfers.
```bash
chmod +x mvnw
./mvnw spring-boot:run
```

4. Seed the Data (Python Script)
   Run this once to create the initial bank accounts (Account 1 and Account 2).
```bash
python3 seed.py
```

2.0