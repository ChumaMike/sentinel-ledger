import psycopg2
import time
import sys

def seed_data():
    # Database Configuration
    db_config = {
        "dbname": "sentinel_db",
        "user": "admin",
        "password": "password",
        "host": "127.0.0.1",
        "port": "5432"
    }

    conn = None
    retries = 5

    # 🧠 System Principle: Retry Logic (Wait-for-IT)
    print("🚀 Starting Database Seed...")
    while retries > 0:
        try:
            conn = psycopg2.connect(**db_config)
            print("✅ Connection Established!")
            break
        except psycopg2.OperationalError as e:
            retries -= 1
            print(f"⚠️ Database not ready. Retrying in 3 seconds... ({retries} attempts left)")
            time.sleep(3)

    if not conn:
        print("❌ CRITICAL: Could not connect to the database. Is the Docker container running?")
        sys.exit(1)

    try:
        cur = conn.cursor()
        print("🔨 Ensuring Schema Integrity...")

        # 1. Create tables if they don't exist (Enterprise Idempotency)
        cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                                                         user_id SERIAL PRIMARY KEY,
                                                         full_name VARCHAR(255),
                        email VARCHAR(255)
                        );
                    CREATE TABLE IF NOT EXISTS accounts (
                                                            account_id SERIAL PRIMARY KEY,
                                                            user_id INTEGER REFERENCES users(user_id),
                        balance DECIMAL(15,2),
                        currency VARCHAR(10)
                        );
                    CREATE TABLE IF NOT EXISTS transactions (
                                                                transaction_id SERIAL PRIMARY KEY,
                                                                from_account_id INTEGER,
                                                                to_account_id INTEGER,
                                                                amount DECIMAL(15,2),
                        status VARCHAR(50),
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """)
        conn.commit()

        print("🧹 Cleaning old data...")
        cur.execute("TRUNCATE TABLE transactions, accounts, users RESTART IDENTITY CASCADE;")
        conn.commit()

        print("👤 Creating User & Accounts...")
        cur.execute("INSERT INTO users (full_name, email) VALUES (%s, %s) RETURNING user_id",
                    ("Chuma Meyiswa", "nmeyiswa@gmail.com"))
        u_id = cur.fetchone()[0]

        cur.execute("INSERT INTO accounts (user_id, balance, currency) VALUES (%s, 15000.50, 'ZAR')", (u_id,))
        cur.execute("INSERT INTO accounts (user_id, balance, currency) VALUES (%s, 2500.00, 'ZAR')", (u_id,))

        conn.commit()
        print("🌟 SUCCESS: Database synchronized!")

    except Exception as error:
        print(f"❌ Error: {error}")
        conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()
            print("🔌 Database connection closed.")

if __name__ == "__main__":
    seed_data()