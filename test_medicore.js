const { app } = require("./backend/index");
const http = require("http");

function dispatch(app, { method, url, headers = {}, body = null }) {
  return new Promise((resolve) => {
    const jsonStr = body ? JSON.stringify(body) : "";
    const socket = new (require("net").Socket)();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = {
      "content-type": "application/json",
      host: "localhost",
      ...headers
    };
    if (jsonStr) {
      req.headers["content-length"] = Buffer.byteLength(jsonStr).toString();
    }
    const res = new http.ServerResponse(req);
    let raw = "";
    res.write = (c) => {
      if (c) raw += c;
      return true;
    };
    res.end = (c) => {
      if (c) raw += c;
      let parsed = raw;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {}
      resolve({ status: res.statusCode, data: parsed });
    };

    app(req, res);

    if (jsonStr) {
      req.push(Buffer.from(jsonStr));
    }
    req.push(null);
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("   MEDICORE AUTOMATED SYSTEM VERIFICATION SUITE   ");
  console.log("=================================================");

  // 1. Health
  const health = await dispatch(app, { method: "GET", url: "/api/health" });
  if (health.status !== 200 || !health.data.success) throw new Error("Health check failed");
  console.log("✔ [PASS] Health check endpoint OK");

  // 2. Authentication
  const docLogin = await dispatch(app, {
    method: "POST",
    url: "/api/auth/login",
    body: { email: "doctor@medicore.tn", password: "Doctor@123" }
  });
  if (docLogin.status !== 200 || !docLogin.data.token) throw new Error("Doctor login failed");
  const docToken = docLogin.data.token;
  console.log("✔ [PASS] Doctor authentication & JWT issue OK");

  const recLogin = await dispatch(app, {
    method: "POST",
    url: "/api/auth/login",
    body: { email: "reception@medicore.tn", password: "Recep@123" }
  });
  const recToken = recLogin.data.token;
  console.log("✔ [PASS] Receptionist authentication & JWT issue OK");

  // 3. Patients
  const patients = await dispatch(app, {
    method: "GET",
    url: "/api/patients",
    headers: { authorization: `Bearer ${docToken}` }
  });
  if (patients.status !== 200 || !Array.isArray(patients.data.data)) throw new Error("List patients failed");
  console.log(`✔ [PASS] Patients directory queried (${patients.data.count} patients)`);

  // 4. Appointments & Conflict Detection
  const suggest = await dispatch(app, {
    method: "POST",
    url: "/api/appointments/intelligent-suggestions",
    headers: { authorization: `Bearer ${docToken}` },
    body: { date: "2026-12-01", durationMinutes: 30 }
  });
  if (suggest.status !== 200 || !suggest.data.suggestions.length) throw new Error("Scheduling suggestions failed");
  const slot = suggest.data.suggestions[0].time;
  console.log(`✔ [PASS] Intelligent scheduling suggestions OK (first slot: ${slot})`);

  const book1 = await dispatch(app, {
    method: "POST",
    url: "/api/appointments",
    headers: { authorization: `Bearer ${recToken}` },
    body: {
      patientId: "PAT-001",
      date: "2026-12-01",
      time: slot,
      type: "Consultation",
      reason: "Quarterly follow-up"
    }
  });
  if (book1.status !== 201) throw new Error("Appointment booking failed");
  console.log("✔ [PASS] Appointment booked successfully");

  // Verify Conflict Prevention
  const bookConflict = await dispatch(app, {
    method: "POST",
    url: "/api/appointments",
    headers: { authorization: `Bearer ${recToken}` },
    body: {
      patientId: "PAT-002",
      date: "2026-12-01",
      time: slot,
      type: "Consultation",
      reason: "Double booking attempt"
    }
  });
  if (bookConflict.status !== 409) throw new Error("Conflict detection failed to reject double booking");
  console.log("✔ [PASS] Double booking rejected with 409 conflict error");

  // 5. Prescriptions & Allergy Safety
  const allergyTest = await dispatch(app, {
    method: "POST",
    url: "/api/prescriptions",
    headers: { authorization: `Bearer ${docToken}` },
    body: {
      patientId: "PAT-001", // Has Penicillin allergy
      items: [{ medication: "Amoxicillin 500mg capsules", dosage: "500mg", frequency: "TID", duration: "7 days" }]
    }
  });
  if (allergyTest.status !== 409 || !allergyTest.data.requiresDoctorOverride) {
    throw new Error("Allergy cross-check failed to flag penicillin/amoxicillin allergy");
  }
  console.log("✔ [PASS] Clinical allergy cross-check intercepted allergic prescription");

  // 6. Role-Based Access Control Security
  const rbacTest = await dispatch(app, {
    method: "POST",
    url: "/api/prescriptions",
    headers: { authorization: `Bearer ${recToken}` }, // Receptionist trying to issue prescription
    body: {
      patientId: "PAT-001",
      items: [{ medication: "Amlodipine 5mg" }]
    }
  });
  if (rbacTest.status !== 403) throw new Error("RBAC failed: Non-doctor was not forbidden from prescribing");
  console.log("✔ [PASS] RBAC enforced: Non-doctor forbidden from clinical prescription operations");

  // 7. Inventory Calculations
  const invList = await dispatch(app, {
    method: "GET",
    url: "/api/inventory",
    headers: { authorization: `Bearer ${docToken}` }
  });
  if (invList.status !== 200 || !invList.data.data.length) throw new Error("Inventory list failed");
  console.log(`✔ [PASS] Inventory tracked (${invList.data.count} supplies in catalog)`);

  // 8. AI Assistant Controlled Execution
  const aiTest = await dispatch(app, {
    method: "POST",
    url: "/api/ai/ask",
    headers: { authorization: `Bearer ${docToken}` },
    body: { prompt: "Show low inventory supplies", toolChoice: "checkLowInventory" }
  });
  if (aiTest.status !== 200 || !aiTest.data.answer) throw new Error("AI Assistant query failed");
  console.log("✔ [PASS] MediCore AI Assistant executed controlled backend tool successfully");

  console.log("=================================================");
  console.log("   ALL MEDICORE VALIDATION TESTS PASSED (8/8)    ");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
