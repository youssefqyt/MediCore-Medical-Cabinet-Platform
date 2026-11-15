# MediCore — Intelligent Medical Cabinet Management Platform

MediCore is a centralized, digital healthcare operating platform designed specifically for independent doctors, medical practices, and private cabinets. It unifies the entire practice lifecycle—from patient registration and intelligent scheduling to clinical consultations, EMR history, prescriptions with allergy validation, document generation, billing, laboratory tracking, inventory supplies, and an integrated AI assistant.

---

## 1. Quick Start Guide (How to Run)

The application serves both the **REST API** and the **Mobile Web Frontend** from a single unified server.

### Option A: Standard Local Execution (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/youssefqyt/MediCore-Medical-Cabinet-Platform.git
   cd MediCore-Medical-Cabinet-Platform
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Start the application:**
   ```bash
   node index.js
   ```

4. **Access the application in your browser:**
   - 🌐 **Web Application**: [http://localhost:5000](http://localhost:5000)
   - 🩺 **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

> **Note:** The server binds to `0.0.0.0:5000` by default, allowing access via both `http://localhost:5000` on your computer and via your local network IP (e.g., `http://192.168.x.x:5000`) for mobile devices connected to the same Wi-Fi.

---

### Option B: Docker Deployment

1. **Start with Docker Compose:**
   ```bash
   docker-compose up --build -d
   ```

2. **Verify container health:**
   ```bash
   docker ps
   curl http://localhost:5000/api/health
   ```

3. **Stop containers:**
   ```bash
   docker-compose down
   ```

---

## 2. Synthetic Demo Accounts

MediCore automatically seeds initial synthetic healthcare data on first startup. You can sign in using any of the role accounts below:

| Role | Email | Password | Primary Workspace Capabilities |
| :--- | :--- | :--- | :--- |
| **Doctor** | `doctor@medicore.tn` | `Doctor@123` | Full clinical access, EMR, consultations, prescriptions, certificates, AI assistant |
| **Receptionist** | `reception@medicore.tn` | `Recep@123` | Patient check-in, calendar scheduling, waiting room triage, payment registration |
| **Nurse** | `nurse@medicore.tn` | `Nurse@123` | Vital signs, patient triage, laboratory results attachment, supply consumption |
| **Administrator** | `admin@medicore.tn` | `Admin@123` | Cabinet settings, staff directory, financial reports, audit trails |
| **Patient** | `patient@medicore.tn` | `Patient@123` | Patient portal: Request appointments, view prescriptions and invoices |

> 💡 **Role Switcher in UI:** You can also use the dropdown switcher at the top of the sidebar in the web app to switch active roles instantly without logging out.

---

## 3. Running Automated Tests

MediCore includes a built-in end-to-end integration and security test suite:

```bash
# Run from the project root
node test_medicore.js
```

### Test Suite Coverage:
1. `GET /api/health` — Service availability.
2. `POST /api/auth/login` — Authentication & JWT issuance for Doctor and Receptionist.
3. `GET /api/patients` — Directory filtering and EMR access.
4. `POST /api/appointments/intelligent-suggestions` — Automatic time slot calculation.
5. `POST /api/appointments` — Appointment booking.
6. `POST /api/appointments` (Conflict test) — **Verifies 409 error preventing double bookings**.
7. `POST /api/prescriptions` (Allergy test) — **Verifies 409 error intercepting penicillin allergy conflict**.
8. `POST /api/prescriptions` (RBAC test) — **Verifies 403 error preventing unauthorized receptionist prescribing**.
9. `GET /api/inventory` — Supply stock calculation.
10. `POST /api/ai/ask` — MediCore AI Assistant controlled backend tool execution.

---

## 4. Environment Variables Configuration

The application uses sane defaults out of the box (with zero-configuration file storage). You can customize settings in `backend/.env`:

```env
PORT=5000
HOST=0.0.0.0
JWT_SECRET=medicore-secure-development-secret-2026
USE_FILE_DB=true

# Optional PostgreSQL Configuration (if connecting to external database)
# DB_CLIENT=pg
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=medicore_app
```

---

## 5. System Architecture & Features

```
                      +---------------------------------------+
                      |         Web / Mobile Client           |
                      |   React 19 · Responsive Medical UI    |
                      +-------------------+-------------------+
                                          |
                                          | HTTP / WebSockets (Port 5000)
                                          v
                      +---------------------------------------+
                      |          Express 5.x Backend          |
                      |  JWT Auth · RBAC · HIPAA Audit Logs   |
                      +-------------------+-------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
         +--------------------------+           +--------------------------+
         |     MediCore Storage     |           |       MediCore AI        |
         |  PostgreSQL / JSON Store |           | Controlled Tool Registry |
         +--------------------------+           +--------------------------+
```

### Modules Included:
- **Dashboard & KPIs**: Daily appointments, waiting room counter, verified daily revenue, and low-stock alerts.
- **Patient Management (EMR)**: Complete longitudinal medical timeline, blood group, allergies, chronic conditions, and audit-controlled record merging.
- **Intelligent Appointment Scheduling**: Time slot suggestions, calendar statuses (`Pending`, `Confirmed`, `Arrived`, `In consultation`, `Completed`, `Cancelled`, `No-show`), and conflict validation.
- **Clinical Consultations**: Structured clinical notes, physical examination findings, vital signs (BP, HR, SpO2, Temp, BMI), diagnosis, and treatment plans with non-destructive amendment logs.
- **Prescription Management**: Configurable drug catalog, dosage directions, and **clinical allergy safety cross-checks**. Printable PDF view.
- **Medical Documents**: Professional sick leave certificates, fitness certificates, and specialist referral letters.
- **Billing & Payments**: Consultation fee tracking, invoices, partial payments, and verified revenue calculations.
- **Supplies & Inventory**: Medical supply tracking with restock/consumption movements and low-stock warnings.
- **Laboratory Tracking**: Examination ordering, status tracking, and result attachment.
- **Cabinet Staff & RBAC**: Strict server-side permission checks protecting clinical records.
- **MediCore AI Assistant**: Grounded AI assistant with validated backend tools for patient lookup, scheduling, EMR summaries, low inventory alerts, and revenue intelligence.
- **Patient Portal**: Patient-specific self-service workspace.

---

## 6. Troubleshooting

- **Port 5000 already in use:**
  Change the port in `backend/.env`:
  ```env
  PORT=5001
  ```
  Then access at `http://localhost:5001`.

- **Reset database to fresh demo state:**
  Delete `medicore_data.json` in the root folder and restart the server (`node index.js`). A fresh synthetic database will be created and seeded automatically.
