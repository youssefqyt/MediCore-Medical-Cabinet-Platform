# MediCore — Intelligent Medical Cabinet Management Platform

MediCore is a centralized, digital healthcare operating platform built specifically for independent doctors, medical practices, and private cabinets. It unifies the entire practice lifecycle—from patient registration and scheduling to clinical consultations, EMR history, prescriptions with allergy validation, document generation, billing, laboratory tracking, inventory supplies, and an integrated AI assistant.

---

## 1. Problem Solved & Objectives

Traditional medical cabinets often struggle with:
- Fragmented paper records and missing clinical history.
- Scheduling conflicts, double bookings, and inefficient appointment spacing.
- Disconnected billing, unrecorded cash payments, and lost revenue.
- Manual prescription writing vulnerable to unflagged drug-allergy interactions.
- Tedious certificate and document generation.
- Isolated inventory where medical supplies unexpectedly run out.

**MediCore unifies all cabinet activities into ONE connected platform**, giving doctors, receptionists, nurses, and administrators role-based workspaces tailored to their daily operations.

---

## 2. Complete Module & Feature List

1. **Dashboard & Analytics**
   - Real-time KPIs: Today's appointments, patients in waiting room, active consultations, verified daily revenue, and low stock warnings.
   - Comprehensive practice statistics: Total patients, revenue trends, consultation breakdown.
2. **Patient Management (EMR)**
   - Unified directory with search by name, phone number, and unique patient ID (`PAT-XXX`).
   - Longitudinal patient timeline (consultations, appointments, prescriptions, labs, invoices).
   - Medical history, blood group, recorded allergies, and chronic conditions.
   - Audit-controlled duplicate patient record merging (`/api/patients/merge`).
3. **Appointment Scheduling & Intelligent Engine**
   - Calendar management with multi-status tracking: `Pending`, `Confirmed`, `Arrived`, `In consultation`, `Completed`, `Cancelled`, `No-show`.
   - **Intelligent Scheduling Engine** (`/api/appointments/intelligent-suggestions`): Suggests optimal slots considering doctor hours, breaks, and existing bookings.
   - **Backend Conflict Detection**: Strict transaction-level validation preventing double bookings.
4. **Clinical Consultations**
   - Step-by-step clinical workflow: Reason, symptoms, physical examination findings, vital signs (BP, HR, SpO2, Temp, BMI), diagnosis, and treatment plans.
   - Support for `Draft` and `Finalized` records.
   - **Secure Amendment Trail**: Finalized clinical records cannot be silently overwritten; amendments require documented clinical justifications and are tracked in audit logs.
5. **Prescriptions Management & Safety**
   - Digital prescription creation linked to patient consultations.
   - Configurable medical catalog (dosages, frequencies, durations).
   - **Clinical Allergy Safety Cross-Check**: Flags severe drug-allergy conflicts (e.g., penicillin allergy with amoxicillin) requiring explicit physician review and override.
   - Printable professional PDF layout generator with doctor digital signature.
6. **Medical Document & Certificate Generation**
   - Sick leave certificates with mandatory rest duration and start dates.
   - General medical fitness certificates and specialist referral letters.
   - Automated inclusion of cabinet header, doctor credentials, and patient identifiers.
7. **Billing & Financial Management**
   - Automatic invoice generation upon consultation completion.
   - Multiple payment methods: Cash, Bank Transfer, Card.
   - Partial payments, balance tracking, and settled status calculation.
   - Real financial analytics calculated from actual database records (in TND / configurable currency).
8. **Medical Supplies & Inventory**
   - Catalog tracking: Gloves, masks, syringes, disinfectants, ECG paper, etc.
   - Automated stock movement tracking (`IN` restock, `OUT` clinical consumption).
   - Low-stock safety alerts triggered when current stock falls below minimum threshold.
9. **Laboratory & Examination Management**
   - Order clinical laboratory tests and specialized examinations.
   - Status workflow: `Requested` ➔ `Sent` ➔ `In Progress` ➔ `Completed` ➔ `Reviewed`.
   - Manual result summary attachment and physician review indicator.
10. **Cabinet Staff & Access Control**
    - Granular Role-Based Access Control (RBAC): `DOCTOR`, `RECEPTIONIST`, `NURSE`, `ADMIN`, `PATIENT`.
    - Server-side role enforcement on all API routes.
    - Security audit logs tracking sensitive record access and clinical modifications.
11. **MediCore AI Assistant**
    - Grounded AI orchestrator with controlled backend tools.
    - Authorized tools: Patient search, schedule inspection, patient history summary, low stock inspection, and financial analytics.
    - Strict role validation: Clinical summaries restricted to physicians; financial summaries restricted to administrators/physicians.
    - Full execution metadata logging (`ai_runs`).
12. **Notifications System**
    - Multi-channel notification pipeline (Patient arrivals, upcoming appointments, low inventory alerts, unpaid balances).
    - WebSocket real-time updates and push notification infrastructure.
13. **Patient Portal**
    - Dedicated view for patients to view upcoming appointments, request new slots, inspect authorized prescriptions, and view billing receipts.

---

## 3. User Roles & Permissions

| Role | Access Permissions |
| :--- | :--- |
| **DOCTOR** | Full access to clinical workflows, consultations, prescriptions, EMR, certificates, labs, analytics, and AI. |
| **RECEPTIONIST** | Patient registration, calendar booking, arrivals tracking, payments recording. Restricted from clinical notes. |
| **NURSE** | Patient directory, vital signs recording, laboratory results attachment, clinical preparation, inventory consumption. |
| **ADMIN** | Cabinet configuration, staff directory, financial reports, inventory oversight, and HIPAA audit trails. |
| **PATIENT** | Patient portal: View own upcoming appointments, request slots, view authorized prescriptions and invoices. |

---

## 4. Architecture & Technology Stack

```
   +--------------------------------------------------------------+
   |                     Frontend Client                          |
   |   React Native Web / Modern Medical UI / Vite / Expo Web     |
   +------------------------------+-------------------------------+
                                  | REST API & WebSockets
   +------------------------------v-------------------------------+
   |                      Express 5.x Backend                     |
   |   JWT Authentication · RBAC · Rate Limiting · Audit Log     |
   +------------------------------+-------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
   +--------v----------+                     +----------v---------+
   |   MediCore Data   |                     |     MediCore AI    |
   |   Persistence     |                     |    Orchestrator    |
   | PostgreSQL / JSON |                     |  Controlled Tools  |
   +-------------------+                     +--------------------+
```

- **Backend**: Node.js, Express 5.x, JWT (`jsonwebtoken`), Socket.IO, Cryptographic hashing (`crypto.scrypt`).
- **Database**: Dual-engine architecture supporting PostgreSQL (`pg`) with automatic file-backed JSON fallback storage for local zero-dependency development.
- **Frontend**: React 19, React Native Web, HTML5/CSS3 custom medical design system with responsive sidebar, KPI cards, and modal dialogs.
- **DevOps**: Docker, Docker Compose, automated test scripts (`test_medicore.js`).

---

## 5. Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- (Optional) Docker & Docker Compose

### Environment Variables
Configure your `.env` file in `backend/.env`:
```env
PORT=5000
JWT_SECRET=medicore-secure-development-secret-2026
USE_FILE_DB=true
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=medicore_app
```

### Installation Commands
```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Run Database & Backend Server
node index.js
```

The backend server starts on `http://localhost:5000` and automatically seeds initial synthetic data on first run.

---

## 6. Running Tests

Execute the comprehensive automated test suite:
```bash
node test_medicore.js
```
The suite verifies:
1. Health endpoint.
2. Doctor & Receptionist authentication.
3. Patient directory & search.
4. Intelligent scheduling & double booking prevention (409 conflict).
5. Prescription creation with clinical allergy cross-check.
6. RBAC security enforcement (403 forbidden).
7. Inventory tracking & movement.
8. Grounded AI Assistant tool execution.

---

## 7. Synthetic Demo Accounts

Use these synthetic credentials for testing and development:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Doctor** | `doctor@medicore.tn` | `Doctor@123` |
| **Receptionist** | `reception@medicore.tn` | `Recep@123` |
| **Nurse** | `nurse@medicore.tn` | `Nurse@123` |
| **Administrator** | `admin@medicore.tn` | `Admin@123` |
| **Patient** | `patient@medicore.tn` | `Patient@123` |

---

## 8. Docker Deployment

Deploy with Docker Compose:
```bash
docker-compose up --build -d
```
Inspect health status:
```bash
curl http://localhost:5000/api/health
```

---

## 9. Current Development Status

- **Architecture & Transformation**: `COMPLETED`
- **Authentication & RBAC**: `COMPLETED`
- **Patient Management & EMR**: `COMPLETED`
- **Appointment Scheduling & Conflict Prevention**: `COMPLETED`
- **Consultations & Amendment Trail**: `COMPLETED`
- **Prescriptions & Allergy Safety**: `COMPLETED`
- **Medical Documents & Certificates**: `COMPLETED`
- **Billing & Revenue Calculations**: `COMPLETED`
- **Staff Management & Audit Trail**: `COMPLETED`
- **Inventory & Medical Supplies**: `COMPLETED`
- **Laboratory Examination Tracking**: `COMPLETED`
- **Notifications & Real-time WebSockets**: `COMPLETED`
- **MediCore AI Assistant Engine**: `COMPLETED`
- **Patient Portal**: `COMPLETED`
- **Automated Verification Suite**: `COMPLETED`
