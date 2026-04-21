# 🛡️ Sentinel Ledger — Enterprise Banking & Fraud Monitor

![Stack](https://img.shields.io/badge/stack-Java%20%7C%20Python%20%7C%20React-blue)
![Architecture](https://img.shields.io/badge/architecture-monorepo-success)
![License](https://img.shields.io/badge/license-MIT-green)

A polyglot financial ledger built for high-volume transactions, double-entry bookkeeping, and real-time fraud monitoring. Features a "God Mode" admin console, lifestyle auditing, and dynamic goal tracking.

---

## Why this exists

Most banking demos cut corners on either the ledger (single-entry, no atomicity) or the fraud layer (static rules, no ML). Sentinel does both properly — **ACID-compliant double-entry transactions in Java Spring, independent fraud monitoring in Python FastAPI, admin tooling in React** — so you can see each concern live as its own service.

---

## 📂 Architecture

Monorepo organised by domain:

| Module | Stack | Role |
| :--- | :--- | :--- |
| `core-engine` | Java 17 · Spring Boot | Ledger core — atomic transactions, account logic |
| `web-service` | Java 17 · Spring Security | REST gateway — auth, external integrations |
| `sentinel-dashboard` | React · Vite · Recharts | Admin console — flow visualisation, audit logs |
| `sentinel-monitor` | Python 3.11 · FastAPI | Fraud detection + health monitoring |
| `database` | PostgreSQL 15 | Persistent storage with migrations |

---

## 🚀 Quick Start

One-command launch via Docker Compose — brings up DB, Java core, Python monitor, and React dashboard together.

```bash
# Clean slate (wipes volumes)
docker compose down -v

# Build & launch
docker compose up --build
```

Services exposed:

| Service | URL |
| :--- | :--- |
| React Dashboard | `http://localhost:5173` |
| Java REST API | `http://localhost:8080` |
| Python Monitor | `http://localhost:9090` |
| PostgreSQL | `localhost:5432` |

---

## 🔑 Admin Console

Access via the lock icon in the sidebar. Requires a PIN set by the operator in the deployment environment (`ADMIN_PIN` env var). **Never commit the PIN to version control.**

---

## 🧪 Tests

```bash
# Java (from core-engine/)
./mvnw test

# Python (from sentinel-monitor/)
pytest
```

---

## 🗺️ Roadmap

- [ ] Horizontal scaling for the Java core (multi-instance with leader election)
- [ ] ML-based anomaly detection in the Python monitor (replace rule-based alerts)
- [ ] GraphQL layer over the REST gateway
- [ ] End-to-end integration tests via Testcontainers

---

## License

MIT · Built by [Chuma Meyiswa](https://github.com/ChumaMike)
