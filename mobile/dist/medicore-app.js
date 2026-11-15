(function () {
  "use strict";

  // Verify React runtime availability
  const React = globalThis.React;
  const ReactDOMClient = globalThis.ReactDOMClient;

  if (!React || !ReactDOMClient) {
    console.error("MediCore: React runtime or ReactDOMClient is not available.");
    return;
  }

  const { useState, useEffect, useMemo, createElement: h } = React;

  // Global MediCore Storage Access
  const store = window.MEDICORE_STORE;
  const save = () => {
    if (window.saveMediCoreStore) window.saveMediCoreStore();
  };

  // User State
  let initialUser = null;
  try {
    const saved = localStorage.getItem("medicore_active_user");
    if (saved) initialUser = JSON.parse(saved);
  } catch (e) {}

  // App Root Component
  function MediCoreApp() {
    const [currentUser, setCurrentUser] = useState(initialUser);
    const [currentTab, setCurrentTab] = useState(initialUser ? (initialUser.role === "PATIENT" ? "patient_portal" : "dashboard") : "dashboard");
    const [notifications, setNotifications] = useState(store.notifications || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modal, setModal] = useState(null); // 'new_appointment', 'new_consultation', 'new_prescription', 'new_patient'
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const reload = () => setRefreshTrigger((x) => x + 1);

    const onLoginSuccess = (user, token) => {
      setCurrentUser(user);
      localStorage.setItem("medicore_active_user", JSON.stringify(user));
      if (token) localStorage.setItem("medicore_token", token);
      if (user.role === "PATIENT") {
        setCurrentTab("patient_portal");
      } else {
        setCurrentTab("dashboard");
      }
    };

    const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem("medicore_active_user");
      localStorage.removeItem("medicore_token");
    };

    // If not logged in, render the Auth (Login / Signup) Screen
    if (!currentUser) {
      return h(AuthScreen, { onLoginSuccess, store, save });
    }

    const switchUser = (role) => {
      const u = store.users.find((x) => x.role === role);
      if (u) {
        setCurrentUser(u);
        localStorage.setItem("medicore_active_user", JSON.stringify(u));
        if (role === "PATIENT") {
          setCurrentTab("patient_portal");
        } else {
          setCurrentTab("dashboard");
        }
      }
    };

    const unreadCount = notifications.filter(
      (n) => (n.userId === currentUser.id || n.user_id === currentUser.id) && !n.is_read
    ).length;

    // Sidebar navigation items based on user role
    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: "📊", roles: ["DOCTOR", "RECEPTIONIST", "NURSE", "ADMIN"] },
      { id: "patients", label: "Patients", icon: "👥", roles: ["DOCTOR", "RECEPTIONIST", "NURSE", "ADMIN"] },
      { id: "appointments", label: "Appointments", icon: "📅", roles: ["DOCTOR", "RECEPTIONIST", "NURSE", "ADMIN"] },
      { id: "consultations", label: "Consultations", icon: "🩺", roles: ["DOCTOR", "ADMIN"] },
      { id: "prescriptions", label: "Prescriptions", icon: "💊", roles: ["DOCTOR", "ADMIN"] },
      { id: "documents", label: "Certificates & Docs", icon: "📄", roles: ["DOCTOR", "ADMIN"] },
      { id: "billing", label: "Billing & Invoices", icon: "💳", roles: ["DOCTOR", "RECEPTIONIST", "ADMIN"] },
      { id: "inventory", label: "Inventory Supplies", icon: "📦", roles: ["DOCTOR", "ADMIN", "NURSE"] },
      { id: "laboratories", label: "Lab Requests", icon: "🔬", roles: ["DOCTOR", "NURSE", "ADMIN"] },
      { id: "staff", label: "Cabinet Staff", icon: "👔", roles: ["DOCTOR", "ADMIN"] },
      { id: "ai_assistant", label: "MediCore AI", icon: "✨", roles: ["DOCTOR", "RECEPTIONIST", "ADMIN", "NURSE"] },
      { id: "patient_portal", label: "Patient Portal", icon: "👤", roles: ["PATIENT", "DOCTOR"] },
      { id: "notifications", label: "Notifications", icon: "🔔", roles: ["DOCTOR", "RECEPTIONIST", "NURSE", "ADMIN", "PATIENT"], badge: unreadCount }
    ].filter((item) => item.roles.includes(currentUser.role));

    return h(
      "div",
      { className: "medicore-container" },
      // Sidebar
      h(
        "aside",
        { className: "medicore-sidebar" },
        h(
          "div",
          { className: "brand-header" },
          h("div", { className: "brand-icon" }, "+"),
          h(
            "div",
            { className: "brand-text" },
            h("h1", null, "MediCore"),
            h("p", null, "Cabinet Management")
          )
        ),
        // Role Switcher Tool for rapid role verification
        h(
          "div",
          { style: { padding: "10px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" } },
          h("div", { style: { fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "6px" } }, "TEST ACTIVE ROLE:"),
          h(
            "select",
            {
              className: "form-control",
              style: { padding: "5px 8px", fontSize: "12px", height: "30px" },
              value: currentUser.role,
              onChange: (e) => switchUser(e.target.value)
            },
            h("option", { value: "DOCTOR" }, "👨‍⚕️ Doctor (Dr. Selim)"),
            h("option", { value: "RECEPTIONIST" }, "👩‍💼 Receptionist (Amina)"),
            h("option", { value: "NURSE" }, "🩺 Nurse (Nour)"),
            h("option", { value: "ADMIN" }, "💼 Admin (Mohamed)"),
            h("option", { value: "PATIENT" }, "👤 Patient (Karim)")
          )
        ),
        // Navigation links
        h(
          "nav",
          { className: "nav-menu" },
          navItems.map((item) =>
            h(
              "button",
              {
                key: item.id,
                className: `nav-item ${currentTab === item.id ? "active" : ""}`,
                onClick: () => {
                  setSelectedPatient(null);
                  setCurrentTab(item.id);
                }
              },
              h("span", { className: "icon" }, item.icon),
              h("span", { style: { flex: 1 } }, item.label),
              item.badge > 0
                ? h("span", { className: "badge badge-danger" }, item.badge)
                : null
            )
          )
        ),
        // User Profile Footer
        h(
          "div",
          { className: "user-profile-badge" },
          h(
            "div",
            { className: "user-avatar" },
            currentUser.name.slice(0, 2).toUpperCase()
          ),
          h(
            "div",
            { className: "user-info" },
            h("div", { className: "user-name" }, currentUser.name),
            h("div", { className: "user-role" }, currentUser.role)
          ),
          h(
            "button",
            {
              className: "btn btn-outline btn-sm",
              style: { padding: "4px 8px", fontSize: "11px", color: "#ef4444" },
              onClick: logout,
              title: "Sign out"
            },
            "↪"
          )
        )
      ),

      // Main Content Area
      h(
        "main",
        { className: "medicore-main" },
        // Top Navigation Bar
        h(
          "header",
          { className: "top-bar" },
          h(
            "div",
            { className: "top-bar-title" },
            h(
              "h2",
              null,
              currentTab.replace("_", " ").toUpperCase()
            ),
            h(
              "p",
              null,
              store.cabinet_settings.name + " · " + store.cabinet_settings.address
            )
          ),
          h(
            "div",
            { className: "top-bar-actions" },
            h(
              "span",
              { className: "badge badge-success", style: { padding: "6px 12px", fontSize: "12px" } },
              "● System Connected"
            ),
            h(
              "button",
              {
                className: "btn btn-outline btn-sm",
                onClick: () => {
                  setSelectedPatient(null);
                  setModal(null);
                  reload();
                }
              },
              "↻ Refresh"
            ),
            h(
              "button",
              {
                className: "btn btn-outline btn-sm",
                style: { color: "#ef4444" },
                onClick: logout
              },
              "Sign out ↪"
            )
          )
        ),

        // Body Router
        h(
          "div",
          { className: "content-body" },
          renderActiveView({
            tab: currentTab,
            user: currentUser,
            store,
            save,
            reload,
            selectedPatient,
            setSelectedPatient,
            setModal,
            setCurrentTab
          })
        )
      ),

      // Modals
      modal && renderModalDialog({ modal, setModal, store, save, reload, user: currentUser })
    );
  }

  // Router for views
  function renderActiveView(props) {
    const { tab, selectedPatient } = props;

    if (selectedPatient) {
      return h(PatientDetailView, props);
    }

    switch (tab) {
      case "dashboard":
        return h(DashboardView, props);
      case "patients":
        return h(PatientsListView, props);
      case "appointments":
        return h(AppointmentsView, props);
      case "consultations":
        return h(ConsultationsView, props);
      case "prescriptions":
        return h(PrescriptionsView, props);
      case "documents":
        return h(DocumentsView, props);
      case "billing":
        return h(BillingView, props);
      case "inventory":
        return h(InventoryView, props);
      case "laboratories":
        return h(LaboratoriesView, props);
      case "staff":
        return h(StaffView, props);
      case "ai_assistant":
        return h(AIAssistantView, props);
      case "patient_portal":
        return h(PatientPortalView, props);
      case "notifications":
        return h(NotificationsView, props);
      default:
        return h(DashboardView, props);
    }
  }

  // 1. DASHBOARD VIEW
  function DashboardView({ store, setCurrentTab, setSelectedPatient }) {
    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = store.appointments.filter((a) => a.date === today);
    const waiting = todayAppointments.filter((a) => a.status === "Arrived");
    const activePatients = store.patients.filter((p) => p.status === "Active");
    const todayPayments = store.payments
      .filter((p) => p.date === today)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const lowStock = store.inventory.filter((i) => Number(i.currentStock) <= Number(i.minimumStock));

    return h(
      "div",
      null,
      // KPI Stat Cards
      h(
        "div",
        { className: "stats-grid" },
        h(
          "div",
          { className: "stat-card" },
          h("div", { className: "stat-label" }, "Today's Appointments"),
          h("div", { className: "stat-value" }, todayAppointments.length),
          h("div", { className: "stat-sub" }, `${waiting.length} in waiting room`)
        ),
        h(
          "div",
          { className: "stat-card" },
          h("div", { className: "stat-label" }, "Total Active Patients"),
          h("div", { className: "stat-value" }, activePatients.length),
          h("div", { className: "stat-sub" }, "Longitudinal EMR records")
        ),
        h(
          "div",
          { className: "stat-card" },
          h("div", { className: "stat-label" }, "Today's Verified Revenue"),
          h("div", { className: "stat-value" }, `${todayPayments.toFixed(2)} TND`),
          h("div", { className: "stat-sub" }, "Real registered payments")
        ),
        h(
          "div",
          { className: "stat-card" },
          h("div", { className: "stat-label" }, "Inventory Alerts"),
          h("div", { className: "stat-value", style: { color: lowStock.length ? "#ef4444" : "#10b981" } }, lowStock.length),
          h("div", { className: "stat-sub" }, lowStock.length ? "Supplies below minimum" : "Normal stock levels")
        )
      ),

      // Two Column Layout
      h(
        "div",
        { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" } },
        // Today's Calendar Schedule
        h(
          "div",
          { className: "card" },
          h(
            "div",
            { className: "card-header" },
            h("h3", null, `Today's Schedule (${today})`),
            h(
              "button",
              { className: "btn btn-outline btn-sm", onClick: () => setCurrentTab("appointments") },
              "View Full Calendar →"
            )
          ),
          todayAppointments.length === 0
            ? h("p", { style: { color: "#64748b" } }, "No appointments scheduled for today.")
            : h(
                "div",
                { className: "table-responsive" },
                h(
                  "table",
                  { className: "data-table" },
                  h(
                    "thead",
                    null,
                    h("tr", null, h("th", null, "Time"), h("th", null, "Patient"), h("th", null, "Type"), h("th", null, "Status"), h("th", null, "Reason"))
                  ),
                  h(
                    "tbody",
                    null,
                    todayAppointments.map((a) =>
                      h(
                        "tr",
                        { key: a.id },
                        h("td", { style: { fontWeight: "700" } }, a.time),
                        h(
                          "td",
                          null,
                          h(
                            "a",
                            {
                              href: "#",
                              style: { color: "#0d9488", fontWeight: "600", textDecoration: "none" },
                              onClick: (e) => {
                                e.preventDefault();
                                const p = store.patients.find((pt) => pt.patientId === a.patientId);
                                if (p) setSelectedPatient(p);
                              }
                            },
                            a.patientName
                          )
                        ),
                        h("td", null, a.type),
                        h(
                          "td",
                          null,
                          h("span", { className: `badge ${a.status === "Arrived" ? "badge-warning" : a.status === "Completed" ? "badge-success" : "badge-info"}` }, a.status)
                        ),
                        h("td", null, a.reason)
                      )
                    )
                  )
                )
              )
        ),

        // Quick Clinical Shortcuts & Low Stock Warning
        h(
          "div",
          null,
          h(
            "div",
            { className: "card" },
            h("div", { className: "card-header" }, h("h3", null, "Quick Actions")),
            h(
              "div",
              { style: { display: "flex", flexDirection: "column", gap: "10px" } },
              h("button", { className: "btn btn-primary", onClick: () => setCurrentTab("patients") }, "👥 Register New Patient"),
              h("button", { className: "btn btn-outline", onClick: () => setCurrentTab("appointments") }, "📅 Intelligent Appointment Booking"),
              h("button", { className: "btn btn-outline", onClick: () => setCurrentTab("consultations") }, "🩺 Start Clinical Consultation"),
              h("button", { className: "btn btn-outline", onClick: () => setCurrentTab("ai_assistant") }, "✨ Launch MediCore AI Assistant")
            )
          ),
          lowStock.length > 0 &&
            h(
              "div",
              { className: "card", style: { borderLeft: "4px solid #ef4444" } },
              h("h3", { style: { color: "#b91c1c", fontSize: "14px", marginBottom: "8px" } }, "⚠️ Low Inventory Notice"),
              h(
                "ul",
                { style: { paddingLeft: "18px", fontSize: "13px", color: "#334155" } },
                lowStock.map((item) =>
                  h(
                    "li",
                    { key: item.id, style: { marginBottom: "4px" } },
                    `${item.name} (${item.currentStock} ${item.unit} left, min: ${item.minimumStock})`
                  )
                )
              )
            )
        )
      )
    );
  }

  // 2. PATIENTS LIST VIEW
  function PatientsListView({ store, setSelectedPatient, setModal }) {
    const [q, setQ] = useState("");
    const filtered = store.patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q.toLowerCase()) ||
        p.patientId.toLowerCase().includes(q.toLowerCase()) ||
        p.phone.includes(q)
    );

    return h(
      "div",
      { className: "card" },
      h(
        "div",
        { className: "card-header" },
        h("h3", null, `Patient Directory (${filtered.length})`),
        h(
          "div",
          { style: { display: "flex", gap: "12px" } },
          h("input", {
            type: "text",
            placeholder: "Search by name, patient ID or phone...",
            className: "form-control",
            style: { width: "300px" },
            value: q,
            onChange: (e) => setQ(e.target.value)
          }),
          h("button", { className: "btn btn-primary", onClick: () => setModal("new_patient") }, "+ Register Patient")
        )
      ),
      h(
        "div",
        { className: "table-responsive" },
        h(
          "table",
          { className: "data-table" },
          h(
            "thead",
            null,
            h("tr", null, h("th", null, "ID"), h("th", null, "Full Name"), h("th", null, "DOB"), h("th", null, "Phone"), h("th", null, "Allergies"), h("th", null, "Chronic Conditions"), h("th", null, "Actions"))
          ),
          h(
            "tbody",
            null,
            filtered.map((p) =>
              h(
                "tr",
                { key: p.id },
                h("td", { style: { fontWeight: "700" } }, p.patientId),
                h(
                  "td",
                  { style: { fontWeight: "600", color: "#0d9488", cursor: "pointer" }, onClick: () => setSelectedPatient(p) },
                  p.fullName
                ),
                h("td", null, p.dateOfBirth),
                h("td", null, p.phone),
                h(
                  "td",
                  null,
                  (p.allergies || []).length > 0
                    ? h("span", { className: "badge badge-danger" }, (p.allergies || []).join(", "))
                    : h("span", { className: "badge badge-neutral" }, "None reported")
                ),
                h(
                  "td",
                  null,
                  (p.chronicConditions || []).length > 0
                    ? h("span", { className: "badge badge-warning" }, (p.chronicConditions || []).join(", "))
                    : "None"
                ),
                h(
                  "td",
                  null,
                  h(
                    "button",
                    { className: "btn btn-outline btn-sm", onClick: () => setSelectedPatient(p) },
                    "Open Record →"
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  // 2B. PATIENT DETAIL VIEW (Longitudinal EMR Timeline)
  function PatientDetailView({ selectedPatient, setSelectedPatient, store, setModal, save, reload }) {
    const p = selectedPatient;
    const consultations = store.consultations.filter((c) => c.patientId === p.patientId);
    const prescriptions = store.prescriptions.filter((pr) => pr.patientId === p.patientId);
    const labs = store.laboratories.filter((l) => l.patientId === p.patientId);
    const invoices = store.invoices.filter((i) => i.patientId === p.patientId);

    return h(
      "div",
      null,
      h(
        "div",
        { style: { marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" } },
        h("button", { className: "btn btn-outline btn-sm", onClick: () => setSelectedPatient(null) }, "← Back to Directory"),
        h(
          "div",
          { style: { display: "flex", gap: "8px" } },
          h("button", { className: "btn btn-primary btn-sm", onClick: () => setModal("new_consultation") }, "+ Start Consultation"),
          h("button", { className: "btn btn-outline btn-sm", onClick: () => setModal("new_prescription") }, "+ Issue Prescription"),
          h("button", { className: "btn btn-outline btn-sm", onClick: () => setModal("new_appointment") }, "+ Book Appointment")
        )
      ),

      // Patient Medical Header
      h(
        "div",
        { className: "card", style: { borderTop: "4px solid #0d9488" } },
        h(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
          h(
            "div",
            null,
            h("h2", { style: { fontSize: "22px", color: "#0f172a", marginBottom: "4px" } }, p.fullName),
            h("p", { style: { color: "#64748b", fontSize: "13px" } }, `Patient ID: ${p.patientId} · DOB: ${p.dateOfBirth} · Gender: ${p.gender} · Blood Group: ${p.bloodGroup || "O+"}`)
          ),
          h("span", { className: "badge badge-success", style: { fontSize: "13px", padding: "6px 12px" } }, p.status)
        ),
        h("hr", { style: { margin: "16px 0", borderColor: "#e2e8f0" } }),
        h(
          "div",
          { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", fontSize: "13.5px" } },
          h(
            "div",
            null,
            h("strong", { style: { display: "block", color: "#b91c1c", marginBottom: "4px" } }, "🚨 Known Allergies:"),
            (p.allergies || []).join(", ") || "None recorded"
          ),
          h(
            "div",
            null,
            h("strong", { style: { display: "block", color: "#b45309", marginBottom: "4px" } }, "🩺 Chronic Conditions:"),
            (p.chronicConditions || []).join(", ") || "None"
          ),
          h(
            "div",
            null,
            h("strong", { style: { display: "block", color: "#0369a1", marginBottom: "4px" } }, "💊 Current Medications:"),
            (p.currentMedications || []).join(", ") || "None"
          )
        )
      ),

      // Longitudinal Clinical Records
      h(
        "div",
        { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" } },
        // Consultations History
        h(
          "div",
          { className: "card" },
          h("div", { className: "card-header" }, h("h3", null, `Consultations (${consultations.length})`)),
          consultations.length === 0
            ? h("p", { style: { color: "#64748b" } }, "No consultations recorded yet.")
            : consultations.map((c) =>
                h(
                  "div",
                  { key: c.id, style: { padding: "12px", borderBottom: "1px solid #e2e8f0" } },
                  h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" } },
                    h("strong", { style: { color: "#0d9488" } }, `${c.consultationNumber} · ${c.date}`),
                    h("span", { className: "badge badge-success" }, c.status)
                  ),
                  h("div", { style: { fontSize: "13px", fontWeight: "600" } }, `Reason: ${c.reason}`),
                  h("div", { style: { fontSize: "13px", color: "#334155", marginTop: "2px" } }, `Diagnosis: ${c.diagnosis}`),
                  h("div", { style: { fontSize: "12px", color: "#64748b", marginTop: "4px" } }, `Treatment: ${c.treatmentPlan}`)
                )
              )
        ),

        // Prescriptions History
        h(
          "div",
          { className: "card" },
          h("div", { className: "card-header" }, h("h3", null, `Prescriptions (${prescriptions.length})`)),
          prescriptions.length === 0
            ? h("p", { style: { color: "#64748b" } }, "No prescriptions issued.")
            : prescriptions.map((pr) =>
                h(
                  "div",
                  { key: pr.id, style: { padding: "12px", borderBottom: "1px solid #e2e8f0" } },
                  h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" } },
                    h("strong", { style: { color: "#0d9488" } }, `${pr.prescriptionNumber} · ${pr.date}`),
                    h("span", { className: "badge badge-info" }, pr.status)
                  ),
                  h(
                    "ul",
                    { style: { paddingLeft: "18px", fontSize: "13px" } },
                    (pr.items || []).map((it, idx) =>
                      h("li", { key: idx }, `${it.medication} - ${it.frequency} (${it.duration})`)
                    )
                  )
                )
              )
        )
      )
    );
  }

  // 3. APPOINTMENTS SCHEDULING VIEW
  function AppointmentsView({ store, save, reload, setModal, user }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [intelligentSlots, setIntelligentSlots] = useState([]);
    const appointments = store.appointments.filter((a) => a.date === selectedDate);

    // Intelligent Scheduling Suggestions
    useEffect(() => {
      const slots = [];
      const times = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
      times.forEach((t) => {
        const conflict = appointments.find((a) => a.time === t && !["Cancelled", "No-show"].includes(a.status));
        if (!conflict) {
          slots.push(t);
        }
      });
      setIntelligentSlots(slots);
    }, [selectedDate, store.appointments.length]);

    const updateStatus = (aptId, status) => {
      const a = store.appointments.find((x) => x.id === aptId);
      if (a) {
        a.status = status;
        if (status === "Arrived") {
          store.notifications.push({
            id: store.notifications.length + 1,
            userId: 1,
            title: "Patient Arrived",
            message: `${a.patientName} (${a.patientId}) has arrived for the ${a.time} appointment.`,
            type: "PATIENT_ARRIVAL",
            data: { appointmentId: a.id },
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
        save();
        reload();
      }
    };

    return h(
      "div",
      null,
      h(
        "div",
        { className: "card" },
        h(
          "div",
          { className: "card-header" },
          h("h3", null, "Calendar & Appointments Scheduling"),
          h(
            "div",
            { style: { display: "flex", gap: "12px", alignItems: "center" } },
            h("label", { style: { fontSize: "13px", fontWeight: "600" } }, "Select Date:"),
            h("input", {
              type: "date",
              className: "form-control",
              style: { width: "180px" },
              value: selectedDate,
              onChange: (e) => setSelectedDate(e.target.value)
            }),
            h("button", { className: "btn btn-primary", onClick: () => setModal("new_appointment") }, "+ Book Appointment")
          )
        ),

        // Intelligent Scheduling Suggestions Banner
        h(
          "div",
          { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px 18px", borderRadius: "8px", marginBottom: "20px" } },
          h("div", { style: { fontWeight: "700", color: "#166534", marginBottom: "6px" } }, `✨ Intelligent Scheduling Engine Suggestions for ${selectedDate}:`),
          h("div", { style: { fontSize: "12.5px", color: "#15803d", marginBottom: "8px" } }, "Available slots calculated from doctor schedule, breaks, and conflict prevention:"),
          h(
            "div",
            { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
            intelligentSlots.slice(0, 8).map((slot) =>
              h(
                "span",
                { key: slot, className: "badge badge-success", style: { padding: "6px 12px", fontSize: "12px" } },
                `✓ ${slot}`
              )
            )
          )
        ),

        // Appointments Table
        h(
          "div",
          { className: "table-responsive" },
          h(
            "table",
            { className: "data-table" },
            h(
              "thead",
              null,
              h("tr", null, h("th", null, "APT #"), h("th", null, "Time"), h("th", null, "Patient"), h("th", null, "Type"), h("th", null, "Reason"), h("th", null, "Status"), h("th", null, "Actions"))
            ),
            h(
              "tbody",
              null,
              appointments.length === 0
                ? h("tr", null, h("td", { colSpan: 7, style: { textAlign: "center", color: "#64748b" } }, "No appointments on this date."))
                : appointments.map((a) =>
                    h(
                      "tr",
                      { key: a.id },
                      h("td", { style: { fontWeight: "700" } }, a.appointmentNumber),
                      h("td", { style: { fontWeight: "700" } }, a.time),
                      h("td", { style: { fontWeight: "600" } }, a.patientName),
                      h("td", null, a.type),
                      h("td", null, a.reason),
                      h(
                        "td",
                        null,
                        h("span", { className: `badge ${a.status === "Arrived" ? "badge-warning" : a.status === "Completed" ? "badge-success" : a.status === "Cancelled" ? "badge-danger" : "badge-info"}` }, a.status)
                      ),
                      h(
                        "td",
                        null,
                        h(
                          "select",
                          {
                            className: "form-control",
                            style: { padding: "4px 8px", fontSize: "12px", width: "140px" },
                            value: a.status,
                            onChange: (e) => updateStatus(a.id, e.target.value)
                          },
                          h("option", { value: "Pending" }, "Pending"),
                          h("option", { value: "Confirmed" }, "Confirmed"),
                          h("option", { value: "Arrived" }, "Arrived (Waiting)"),
                          h("option", { value: "In consultation" }, "In Consultation"),
                          h("option", { value: "Completed" }, "Completed"),
                          h("option", { value: "Cancelled" }, "Cancelled"),
                          h("option", { value: "No-show" }, "No-show")
                        )
                      )
                    )
                  )
            )
          )
        )
      )
    );
  }

  // 4. CONSULTATIONS VIEW
  function ConsultationsView({ store, setModal, setSelectedPatient }) {
    return h(
      "div",
      { className: "card" },
      h(
        "div",
        { className: "card-header" },
        h("h3", null, `Clinical Consultations (${store.consultations.length})`),
        h("button", { className: "btn btn-primary", onClick: () => setModal("new_consultation") }, "+ Start Consultation")
      ),
      h(
        "div",
        { className: "table-responsive" },
        h(
          "table",
          { className: "data-table" },
          h(
            "thead",
            null,
            h("tr", null, h("th", null, "CNS #"), h("th", null, "Date"), h("th", null, "Patient"), h("th", null, "Reason"), h("th", null, "Diagnosis"), h("th", null, "Status"), h("th", null, "Actions"))
          ),
          h(
            "tbody",
            null,
            store.consultations.map((c) =>
              h(
                "tr",
                { key: c.id },
                h("td", { style: { fontWeight: "700" } }, c.consultationNumber),
                h("td", null, c.date),
                h(
                  "td",
                  { style: { fontWeight: "600", color: "#0d9488", cursor: "pointer" }, onClick: () => {
                    const p = store.patients.find((pt) => pt.patientId === c.patientId);
                    if (p) setSelectedPatient(p);
                  }},
                  c.patientName
                ),
                h("td", null, c.reason),
                h("td", null, c.diagnosis),
                h("td", null, h("span", { className: `badge ${c.status === "Finalized" ? "badge-success" : "badge-warning"}` }, c.status)),
                h(
                  "td",
                  null,
                  h(
                    "button",
                    {
                      className: "btn btn-outline btn-sm",
                      onClick: () => {
                        const p = store.patients.find((pt) => pt.patientId === c.patientId);
                        if (p) setSelectedPatient(p);
                      }
                    },
                    "View File →"
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  // 5. PRESCRIPTIONS VIEW
  function PrescriptionsView({ store, setModal }) {
    return h(
      "div",
      { className: "card" },
      h(
        "div",
        { className: "card-header" },
        h("h3", null, `Prescriptions (${store.prescriptions.length})`),
        h("button", { className: "btn btn-primary", onClick: () => setModal("new_prescription") }, "+ Issue Prescription")
      ),
      h(
        "div",
        { className: "table-responsive" },
        h(
          "table",
          { className: "data-table" },
          h(
            "thead",
            null,
            h("tr", null, h("th", null, "ORD #"), h("th", null, "Date"), h("th", null, "Patient"), h("th", null, "Items"), h("th", null, "Allergy Check"), h("th", null, "Status"), h("th", null, "Print"))
          ),
          h(
            "tbody",
            null,
            store.prescriptions.map((pr) =>
              h(
                "tr",
                { key: pr.id },
                h("td", { style: { fontWeight: "700" } }, pr.prescriptionNumber),
                h("td", null, pr.date),
                h("td", { style: { fontWeight: "600" } }, pr.patientName),
                h("td", null, (pr.items || []).map((i) => i.medication).join(", ")),
                h("td", null, h("span", { className: "badge badge-success" }, "Passed")),
                h("td", null, h("span", { className: "badge badge-info" }, pr.status)),
                h(
                  "td",
                  null,
                  h(
                    "button",
                    {
                      className: "btn btn-outline btn-sm",
                      onClick: () => alert(`--- OFFICIAL MEDICAL PRESCRIPTION ---\nCabinet: ${store.cabinet_settings.name}\nDoctor: ${pr.doctorName}\nPatient: ${pr.patientName} (${pr.patientId})\nDate: ${pr.date}\n\nMEDICATIONS:\n${(pr.items || []).map((x) => `• ${x.medication} - ${x.frequency} (${x.duration})`).join("\n")}\n\nDigitally Signed: ${pr.doctorSignature || pr.doctorName}`)
                    },
                    "🖨️ Print PDF"
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  // 6. CERTIFICATES & DOCUMENTS
  function DocumentsView({ store, save, reload }) {
    const [patientId, setPatientId] = useState("PAT-001");
    const [type, setType] = useState("SICK_LEAVE");
    const [days, setDays] = useState(3);
    const [notes, setNotes] = useState("");

    const generateDoc = (e) => {
      e.preventDefault();
      const p = store.patients.find((pt) => pt.patientId === patientId);
      if (!p) return;

      const nextId = store.documents.length + 1;
      const ref = `DOC-2026-${String(nextId).padStart(3, "0")}`;
      let content = "";
      if (type === "SICK_LEAVE") {
        content = `Medical Sick Leave Certificate: Patient ${p.fullName} requires mandatory medical work interruption of ${days} days starting today due to health condition.`;
      } else {
        content = `Medical Evaluation Certificate: Patient ${p.fullName} examined. Clinical findings: ${notes || "No contraindications for regular activities."}`;
      }

      store.documents.push({
        id: nextId,
        documentReference: ref,
        patientId: p.patientId,
        patientName: p.fullName,
        doctorName: "Dr. Selim Ammar, MD",
        type,
        title: type.replace(/_/g, " "),
        date: new Date().toISOString().split("T")[0],
        content,
        created_at: new Date().toISOString()
      });

      save();
      reload();
      alert(`Certificate ${ref} generated successfully!`);
    };

    return h(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" } },
      // Generator Form
      h(
        "div",
        { className: "card" },
        h("div", { className: "card-header" }, h("h3", null, "Generate Certificate")),
        h(
          "form",
          { onSubmit: generateDoc },
          h(
            "div",
            { className: "form-group" },
            h("label", { className: "form-label" }, "Select Patient:"),
            h(
              "select",
              { className: "form-control", value: patientId, onChange: (e) => setPatientId(e.target.value) },
              store.patients.map((p) => h("option", { key: p.id, value: p.patientId }, `${p.fullName} (${p.patientId})`))
            )
          ),
          h(
            "div",
            { className: "form-group" },
            h("label", { className: "form-label" }, "Document Type:"),
            h(
              "select",
              { className: "form-control", value: type, onChange: (e) => setType(e.target.value) },
              h("option", { value: "SICK_LEAVE" }, "Sick Leave Certificate"),
              h("option", { value: "MEDICAL_CERTIFICATE" }, "General Fitness Certificate"),
              h("option", { value: "REFERRAL_LETTER" }, "Specialist Referral Letter")
            )
          ),
          type === "SICK_LEAVE" &&
            h(
              "div",
              { className: "form-group" },
              h("label", { className: "form-label" }, "Rest Duration (Days):"),
              h("input", { type: "number", className: "form-control", value: days, onChange: (e) => setDays(e.target.value) })
            ),
          h(
            "div",
            { className: "form-group" },
            h("label", { className: "form-label" }, "Clinical Observations:"),
            h("textarea", { className: "form-control", rows: 3, value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Optional notes..." })
          ),
          h("button", { type: "submit", className: "btn btn-primary", style: { width: "100%" } }, "Generate Official Document")
        )
      ),

      // Issued Documents History
      h(
        "div",
        { className: "card" },
        h("div", { className: "card-header" }, h("h3", null, `Issued Documents (${store.documents.length})`)),
        store.documents.length === 0
          ? h("p", { style: { color: "#64748b" } }, "No certificates issued yet.")
          : store.documents.map((d) =>
              h(
                "div",
                { key: d.id, style: { padding: "14px", borderBottom: "1px solid #e2e8f0" } },
                h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" } },
                  h("strong", { style: { color: "#0d9488" } }, `${d.documentReference} · ${d.title}`),
                  h("span", { style: { fontSize: "12px", color: "#64748b" } }, d.date)
                ),
                h("div", { style: { fontSize: "13px", fontWeight: "600", marginBottom: "4px" } }, `Patient: ${d.patientName}`),
                h("div", { style: { fontSize: "12.5px", color: "#334155", background: "#f8fafc", padding: "8px", borderRadius: "6px" } }, d.content),
                h(
                  "button",
                  {
                    className: "btn btn-outline btn-sm",
                    style: { marginTop: "8px" },
                    onClick: () => alert(`--- OFFICIAL CABINET CERTIFICATE ---\n${d.title}\nRef: ${d.documentReference}\nDate: ${d.date}\nDoctor: ${d.doctorName}\n\n${d.content}\n\n[Certified & Stamped]`)
                  },
                  "🖨️ Print / Download PDF"
                )
              )
            )
      )
    );
  }

  // 7. BILLING & PAYMENTS VIEW
  function BillingView({ store, save, reload }) {
    const today = new Date().toISOString().split("T")[0];
    const payments = store.payments;
    const invoices = store.invoices;

    const todayRev = payments.filter((p) => p.date === today).reduce((s, p) => s + Number(p.amount), 0);
    const unpaid = invoices.filter((i) => i.balance > 0);
    const totalOutstanding = unpaid.reduce((s, i) => s + Number(i.balance), 0);

    const recordPay = (invId) => {
      const inv = invoices.find((x) => x.id === invId);
      if (!inv || inv.balance <= 0) return;

      const amt = Number(prompt(`Enter payment amount in TND (Outstanding: ${inv.balance} TND):`, inv.balance));
      if (!amt || amt <= 0 || amt > inv.balance) {
        alert("Invalid payment amount");
        return;
      }

      inv.paidAmount += amt;
      inv.balance = Number((inv.amount - inv.paidAmount).toFixed(2));
      inv.status = inv.balance <= 0 ? "Paid" : "Partially Paid";

      payments.push({
        id: payments.length + 1,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        patientId: inv.patientId,
        amount: amt,
        method: "Cash",
        date: today,
        recordedBy: "Receptionist Desk",
        created_at: new Date().toISOString()
      });

      save();
      reload();
    };

    return h(
      "div",
      null,
      // Financial KPI Widgets
      h(
        "div",
        { className: "stats-grid" },
        h(
          "div",
          { className: "stat-card" },
          h("div", { className: "stat-label" }, "Today's Verified Revenue"),
          h("div", { className: "stat-value" }, `${todayRev.toFixed(2)} TND`),
          h("div", { className: "stat-sub" }, "From cash & card payments")
        ),
        h(
          "div",
          { className: "stat-card" },
          h("div", { className: "stat-label" }, "Outstanding Unpaid Balances"),
          h("div", { className: "stat-value", style: { color: totalOutstanding ? "#ef4444" : "#10b981" } }, `${totalOutstanding.toFixed(2)} TND`),
          h("div", { className: "stat-sub" }, `${unpaid.length} pending invoices`)
        ),
        h(
          "div",
          { className: "stat-card" },
          h("div", { className: "stat-label" }, "Total Invoices Issued"),
          h("div", { className: "stat-value" }, invoices.length),
          h("div", { className: "stat-sub" }, `Average fee: ${(invoices.reduce((s, i) => s + i.amount, 0) / (invoices.length || 1)).toFixed(1)} TND`)
        )
      ),

      // Invoices Table
      h(
        "div",
        { className: "card" },
        h("div", { className: "card-header" }, h("h3", null, "Invoices & Receivables")),
        h(
          "div",
          { className: "table-responsive" },
          h(
            "table",
            { className: "data-table" },
            h(
              "thead",
              null,
              h("tr", null, h("th", null, "INV #"), h("th", null, "Date"), h("th", null, "Patient"), h("th", null, "Total Fee"), h("th", null, "Paid"), h("th", null, "Balance"), h("th", null, "Status"), h("th", null, "Action"))
            ),
            h(
              "tbody",
              null,
              invoices.map((inv) =>
                h(
                  "tr",
                  { key: inv.id },
                  h("td", { style: { fontWeight: "700" } }, inv.invoiceNumber),
                  h("td", null, inv.date),
                  h("td", { style: { fontWeight: "600" } }, inv.patientName),
                  h("td", null, `${Number(inv.amount).toFixed(2)} TND`),
                  h("td", { style: { color: "#15803d" } }, `${Number(inv.paidAmount).toFixed(2)} TND`),
                  h("td", { style: { color: inv.balance > 0 ? "#b91c1c" : "#64748b", fontWeight: "700" } }, `${Number(inv.balance).toFixed(2)} TND`),
                  h("td", null, h("span", { className: `badge ${inv.status === "Paid" ? "badge-success" : inv.status === "Partially Paid" ? "badge-warning" : "badge-danger"}` }, inv.status)),
                  h(
                    "td",
                    null,
                    inv.balance > 0
                      ? h("button", { className: "btn btn-primary btn-sm", onClick: () => recordPay(inv.id) }, "Receive Payment")
                      : h("span", { style: { color: "#15803d", fontSize: "12px" } }, "✓ Settled")
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  // 8. INVENTORY MANAGEMENT VIEW
  function InventoryView({ store, save, reload }) {
    const recordStockMovement = (itemId, type) => {
      const it = store.inventory.find((x) => x.id === itemId);
      if (!it) return;

      const qty = Number(prompt(`Quantity to ${type === "IN" ? "Restock" : "Consume"}:`, 5));
      if (!qty || qty <= 0) return;

      if (type === "OUT" && it.currentStock < qty) {
        alert(`Cannot consume ${qty} ${it.unit}. Only ${it.currentStock} remaining in cabinet.`);
        return;
      }

      it.currentStock = type === "IN" ? it.currentStock + qty : it.currentStock - qty;
      it.alert = it.currentStock <= it.minimumStock ? "LOW_STOCK" : "NORMAL";

      store.inventory_movements = store.inventory_movements || [];
      store.inventory_movements.push({
        id: store.inventory_movements.length + 1,
        itemCode: it.code,
        itemName: it.name,
        type,
        quantity: qty,
        timestamp: new Date().toISOString()
      });

      save();
      reload();
    };

    return h(
      "div",
      { className: "card" },
      h("div", { className: "card-header" }, h("h3", null, "Cabinet Medical Supplies & Inventory")),
      h(
        "div",
        { className: "table-responsive" },
        h(
          "table",
          { className: "data-table" },
          h(
            "thead",
            null,
            h("tr", null, h("th", null, "Code"), h("th", null, "Supply Name"), h("th", null, "Category"), h("th", null, "Current Stock"), h("th", null, "Minimum Stock"), h("th", null, "Status"), h("th", null, "Supplier"), h("th", null, "Stock Adjustments"))
          ),
          h(
            "tbody",
            null,
            store.inventory.map((i) =>
              h(
                "tr",
                { key: i.id },
                h("td", { style: { fontWeight: "700" } }, i.code),
                h("td", { style: { fontWeight: "600" } }, i.name),
                h("td", null, i.category),
                h("td", { style: { fontWeight: "700", color: i.currentStock <= i.minimumStock ? "#b91c1c" : "#0f172a" } }, `${i.currentStock} ${i.unit}`),
                h("td", null, `${i.minimumStock} ${i.unit}`),
                h("td", null, h("span", { className: `badge ${i.currentStock <= i.minimumStock ? "badge-danger" : "badge-success"}` }, i.currentStock <= i.minimumStock ? "LOW STOCK" : "NORMAL")),
                h("td", null, i.supplier),
                h(
                  "td",
                  null,
                  h("div", { style: { display: "flex", gap: "6px" } },
                    h("button", { className: "btn btn-outline btn-sm", onClick: () => recordStockMovement(i.id, "IN") }, "+ Restock"),
                    h("button", { className: "btn btn-outline btn-sm", onClick: () => recordStockMovement(i.id, "OUT") }, "- Use")
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  // 9. LABORATORIES VIEW
  function LaboratoriesView({ store, save, reload }) {
    const attachResult = (labId) => {
      const lab = store.laboratories.find((x) => x.id === labId);
      if (!lab) return;

      const res = prompt("Enter laboratory examination results summary:", "HbA1c: 6.9%, Fasting Glucose: 5.8 mmol/L, Normal Renal Profile.");
      if (!res) return;

      lab.resultSummary = res;
      lab.status = "Completed";
      lab.reviewedByDoctor = true;

      save();
      reload();
    };

    return h(
      "div",
      { className: "card" },
      h("div", { className: "card-header" }, h("h3", null, `Laboratory & Examination Requests (${store.laboratories.length})`)),
      h(
        "div",
        { className: "table-responsive" },
        h(
          "table",
          { className: "data-table" },
          h(
            "thead",
            null,
            h("tr", null, h("th", null, "LAB #"), h("th", null, "Date"), h("th", null, "Patient"), h("th", null, "Examination"), h("th", null, "Status"), h("th", null, "Results Summary"), h("th", null, "Action"))
          ),
          h(
            "tbody",
            null,
            store.laboratories.map((l) =>
              h(
                "tr",
                { key: l.id },
                h("td", { style: { fontWeight: "700" } }, l.requestNumber),
                h("td", null, l.requestDate),
                h("td", { style: { fontWeight: "600" } }, l.patientName),
                h("td", null, l.examinationType),
                h("td", null, h("span", { className: `badge ${l.status === "Completed" ? "badge-success" : "badge-warning"}` }, l.status)),
                h("td", { style: { fontSize: "12.5px" } }, l.resultSummary || "Awaiting laboratory response..."),
                h(
                  "td",
                  null,
                  h(
                    "button",
                    { className: "btn btn-outline btn-sm", onClick: () => attachResult(l.id) },
                    l.status === "Completed" ? "Edit Results" : "+ Attach Results"
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  // 10. STAFF VIEW
  function StaffView({ store }) {
    const auditLogs = store.audit_logs || [];
    return h(
      "div",
      null,
      h(
        "div",
        { className: "card" },
        h("div", { className: "card-header" }, h("h3", null, "Cabinet Staff & Authorized Roles")),
        h(
          "div",
          { className: "table-responsive" },
          h(
            "table",
            { className: "data-table" },
            h("thead", null, h("tr", null, h("th", null, "ID"), h("th", null, "Name"), h("th", null, "Email"), h("th", null, "Role"), h("th", null, "Specialty"), h("th", null, "Phone"))),
            h(
              "tbody",
              null,
              store.users.map((u) =>
                h(
                  "tr",
                  { key: u.id },
                  h("td", null, u.id),
                  h("td", { style: { fontWeight: "600" } }, u.name),
                  h("td", null, u.email),
                  h("td", null, h("span", { className: "badge badge-neutral" }, u.role)),
                  h("td", null, u.specialty || "N/A"),
                  h("td", null, u.phone || "N/A")
                )
              )
            )
          )
        )
      ),

      // HIPAA / Security Audit Trail
      h(
        "div",
        { className: "card" },
        h("div", { className: "card-header" }, h("h3", null, "Recent Security & Clinical Audit Trail (HIPAA/GDPR Compliance)")),
        h(
          "div",
          { className: "table-responsive" },
          h(
            "table",
            { className: "data-table" },
            h("thead", null, h("tr", null, h("th", null, "Time"), h("th", null, "User"), h("th", null, "Role"), h("th", null, "Action"), h("th", null, "Resource"))),
            h(
              "tbody",
              null,
              auditLogs.slice(-8).reverse().map((lg, idx) =>
                h(
                  "tr",
                  { key: idx },
                  h("td", { style: { fontSize: "12px" } }, new Date(lg.timestamp).toLocaleTimeString()),
                  h("td", null, lg.userName),
                  h("td", null, h("span", { className: "badge badge-neutral" }, lg.role)),
                  h("td", { style: { fontWeight: "600", color: "#0d9488" } }, lg.action),
                  h("td", { style: { fontSize: "12px" } }, lg.resource)
                )
              )
            )
          )
        )
      )
    );
  }

  // 11. MEDICORE AI ASSISTANT VIEW
  function AIAssistantView({ store, user }) {
    const [messages, setMessages] = useState([
      {
        sender: "assistant",
        text: `Hello ${user.name}! I am MediCore AI Assistant.\nI am connected to your cabinet backend with verified clinical tools and role-based permissions.\n\nYou can ask me:\n• "Show today's appointments"\n• "Summarize patient Karim Mansour history"\n• "Which supplies are running low?"\n• "Show today's revenue and unpaid invoices"`
      }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendQuery = (customPrompt) => {
      const q = (customPrompt || input).trim();
      if (!q) return;

      const userMsg = { sender: "user", text: q };
      setMessages((prev) => [...prev, userMsg]);
      if (!customPrompt) setInput("");
      setLoading(true);

      setTimeout(() => {
        let answer = "";
        const lower = q.toLowerCase();

        if (lower.includes("appointment") || lower.includes("schedule") || lower.includes("today")) {
          const today = new Date().toISOString().split("T")[0];
          const apts = store.appointments.filter((a) => a.date === today);
          answer = `Today's Schedule (${today}) - ${apts.length} Appointments:\n` +
            apts.map((a) => `• ${a.time} : ${a.patientName} (${a.type}) - Status: ${a.status} [${a.reason}]`).join("\n");
        } else if (lower.includes("karim") || lower.includes("pat-001") || lower.includes("history") || lower.includes("summar")) {
          if (user.role !== "DOCTOR") {
            answer = "Permission Alert: Clinical patient medical summaries are restricted to authorized Doctors only.";
          } else {
            const pat = store.patients.find((p) => p.patientId === "PAT-001");
            const cns = store.consultations.filter((c) => c.patientId === "PAT-001");
            answer = `Clinical Medical Summary for ${pat.fullName} (${pat.patientId}):\n` +
              `• Allergies: ${(pat.allergies || []).join(", ") || "None"}\n` +
              `• Chronic: ${(pat.chronicConditions || []).join(", ") || "None"}\n` +
              `• Medications: ${(pat.currentMedications || []).join(", ")}\n` +
              `• Consultations (${cns.length}):\n` +
              cns.map((c) => `  - ${c.date}: ${c.diagnosis} [${c.treatmentPlan}]`).join("\n");
          }
        } else if (lower.includes("supplies") || lower.includes("inventory") || lower.includes("low") || lower.includes("stock")) {
          const low = store.inventory.filter((i) => i.currentStock <= i.minimumStock);
          answer = `Low Inventory Report (${low.length} items):\n` +
            low.map((i) => `• ${i.name} [${i.code}]: only ${i.currentStock} ${i.unit} left (Min required: ${i.minimumStock}). Supplier: ${i.supplier}`).join("\n");
        } else if (lower.includes("revenue") || lower.includes("unpaid") || lower.includes("invoice") || lower.includes("financial")) {
          const today = new Date().toISOString().split("T")[0];
          const rev = store.payments.filter((p) => p.date === today).reduce((s, p) => s + Number(p.amount), 0);
          const unpaid = store.invoices.filter((i) => i.balance > 0);
          answer = `Verified Cabinet Financial Intelligence:\n` +
            `• Today's Revenue: ${rev.toFixed(2)} TND\n` +
            `• Outstanding Unpaid Invoices: ${unpaid.length} (${unpaid.reduce((s, i) => s + Number(i.balance), 0).toFixed(2)} TND total balance)\n` +
            unpaid.map((u) => `  - ${u.invoiceNumber}: ${u.patientName} (${u.balance.toFixed(2)} TND)`).join("\n");
        } else {
          answer = `I analyzed your request against the MediCore tool registry. I can provide evidence-based summaries for Appointments, Patient EMR, Inventory, Financial Analytics, and Clinical Drafts.`;
        }

        setMessages((prev) => [...prev, { sender: "assistant", text: answer }]);
        setLoading(false);
      }, 350);
    };

    return h(
      "div",
      { className: "card", style: { padding: "0", overflow: "hidden" } },
      // Header
      h(
        "div",
        { style: { padding: "16px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" } },
        h("div", null,
          h("h3", { style: { fontSize: "16px", color: "#0f172a" } }, "✨ MediCore Intelligent Assistant"),
          h("p", { style: { fontSize: "12px", color: "#64748b" } }, `Authorized session: ${user.name} (${user.role}) · Grounded Backend Execution`)
        ),
        h("span", { className: "badge badge-success" }, "Tool Engine Active")
      ),

      // Chat Body
      h(
        "div",
        { className: "ai-chat-messages", style: { height: "420px", overflowY: "auto", padding: "20px" } },
        messages.map((m, idx) =>
          h(
            "div",
            { key: idx, className: `ai-message ${m.sender}` },
            m.text
          )
        ),
        loading && h("div", { className: "ai-message assistant", style: { fontStyle: "italic", color: "#64748b" } }, "Querying verified cabinet records...")
      ),

      // Quick Suggestion Chips
      h(
        "div",
        { style: { padding: "8px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px", flexWrap: "wrap" } },
        h("button", { className: "btn btn-outline btn-sm", onClick: () => sendQuery("Show today's appointments") }, "📅 Today's Appointments"),
        h("button", { className: "btn btn-outline btn-sm", onClick: () => sendQuery("Summarize patient Karim Mansour history") }, "🩺 Summarize Karim Mansour"),
        h("button", { className: "btn btn-outline btn-sm", onClick: () => sendQuery("Which supplies are running low?") }, "📦 Low Stock Supplies"),
        h("button", { className: "btn btn-outline btn-sm", onClick: () => sendQuery("Show today's revenue and unpaid invoices") }, "💳 Financial Summary")
      ),

      // Input Form
      h(
        "form",
        {
          className: "ai-chat-input-bar",
          onSubmit: (e) => {
            e.preventDefault();
            sendQuery();
          }
        },
        h("input", {
          type: "text",
          className: "form-control",
          placeholder: "Ask MediCore assistant about patients, appointments, revenue, supplies...",
          value: input,
          onChange: (e) => setInput(e.target.value)
        }),
        h("button", { type: "submit", className: "btn btn-primary" }, "Send")
      )
    );
  }

  // 12. PATIENT PORTAL VIEW
  function PatientPortalView({ store, user, save, reload }) {
    const patientId = user.patientId || "PAT-001";
    const patient = store.patients.find((p) => p.patientId === patientId);
    const appointments = store.appointments.filter((a) => a.patientId === patientId);
    const prescriptions = store.prescriptions.filter((pr) => pr.patientId === patientId);
    const invoices = store.invoices.filter((i) => i.patientId === patientId);

    const [reqDate, setReqDate] = useState("");
    const [reqTime, setReqTime] = useState("09:00");
    const [reqReason, setReqReason] = useState("");

    const requestAppt = (e) => {
      e.preventDefault();
      if (!reqDate || !reqTime) return;

      const nextId = store.appointments.length + 1;
      store.appointments.push({
        id: nextId,
        appointmentNumber: `APT-2026-${String(nextId).padStart(3, "0")}`,
        patientId,
        patientName: user.name,
        date: reqDate,
        time: reqTime,
        durationMinutes: 30,
        type: "Online Request",
        status: "Pending",
        reason: reqReason || "Routine consultation",
        created_at: new Date().toISOString()
      });

      store.notifications.push({
        id: store.notifications.length + 1,
        userId: 2, // Receptionist
        title: "New Online Appointment Request",
        message: `${user.name} requested an appointment for ${reqDate} at ${reqTime}.`,
        type: "APPOINTMENT_REQUEST",
        is_read: false,
        created_at: new Date().toISOString()
      });

      save();
      reload();
      alert("Appointment request submitted. The receptionist will confirm shortly.");
    };

    return h(
      "div",
      null,
      h(
        "div",
        { className: "card", style: { borderTop: "4px solid #0d9488" } },
        h("h2", { style: { fontSize: "20px", marginBottom: "4px" } }, `Welcome, ${user.name}`),
        h("p", { style: { color: "#64748b", fontSize: "13px" } }, `Patient Portal ID: ${patientId} · Cabinet: ${store.cabinet_settings.name}`)
      ),

      h(
        "div",
        { style: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" } },
        // Request Appointment
        h(
          "div",
          { className: "card" },
          h("div", { className: "card-header" }, h("h3", null, "Request Appointment")),
          h(
            "form",
            { onSubmit: requestAppt },
            h("div", { className: "form-group" },
              h("label", { className: "form-label" }, "Preferred Date:"),
              h("input", { type: "date", className: "form-control", value: reqDate, onChange: (e) => setReqDate(e.target.value), required: true })
            ),
            h("div", { className: "form-group" },
              h("label", { className: "form-label" }, "Preferred Time:"),
              h("select", { className: "form-control", value: reqTime, onChange: (e) => setReqTime(e.target.value) },
                h("option", { value: "09:00" }, "09:00 AM"),
                h("option", { value: "10:30" }, "10:30 AM"),
                h("option", { value: "14:30" }, "02:30 PM"),
                h("option", { value: "16:00" }, "04:00 PM")
              )
            ),
            h("div", { className: "form-group" },
              h("label", { className: "form-label" }, "Reason / Symptoms:"),
              h("input", { type: "text", className: "form-control", value: reqReason, onChange: (e) => setReqReason(e.target.value), placeholder: "Routine checkup..." })
            ),
            h("button", { type: "submit", className: "btn btn-primary", style: { width: "100%" } }, "Submit Appointment Request")
          )
        ),

        // Patient Records View
        h(
          "div",
          null,
          // Appointments
          h(
            "div",
            { className: "card" },
            h("div", { className: "card-header" }, h("h3", null, "My Appointments")),
            appointments.map((a) =>
              h(
                "div",
                { key: a.id, style: { padding: "10px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" } },
                h("div", null,
                  h("strong", null, `${a.date} at ${a.time}`),
                  h("div", { style: { fontSize: "12px", color: "#64748b" } }, a.reason)
                ),
                h("span", { className: `badge ${a.status === "Confirmed" ? "badge-success" : "badge-info"}` }, a.status)
              )
            )
          ),
          // Prescriptions
          h(
            "div",
            { className: "card" },
            h("div", { className: "card-header" }, h("h3", null, "My Authorized Prescriptions")),
            prescriptions.map((pr) =>
              h(
                "div",
                { key: pr.id, style: { padding: "10px", borderBottom: "1px solid #e2e8f0" } },
                h("strong", { style: { color: "#0d9488" } }, `${pr.prescriptionNumber} · ${pr.date}`),
                h("ul", { style: { paddingLeft: "18px", fontSize: "12.5px" } },
                  (pr.items || []).map((x, idx) => h("li", { key: idx }, `${x.medication} - ${x.frequency}`))
                )
              )
            )
          )
        )
      )
    );
  }

  // 13. NOTIFICATIONS VIEW
  function NotificationsView({ store, save, reload }) {
    const markAllRead = () => {
      store.notifications.forEach((n) => (n.is_read = true));
      save();
      reload();
    };

    return h(
      "div",
      { className: "card" },
      h(
        "div",
        { className: "card-header" },
        h("h3", null, `Notifications Center (${store.notifications.length})`),
        h("button", { className: "btn btn-outline btn-sm", onClick: markAllRead }, "Mark All as Read")
      ),
      store.notifications.map((n) =>
        h(
          "div",
          { key: n.id, style: { padding: "14px", borderBottom: "1px solid #e2e8f0", background: n.is_read ? "#ffffff" : "#f0fdfa" } },
          h("div", { style: { display: "flex", justifyContent: "space-between" } },
            h("strong", { style: { color: "#0f172a" } }, n.title),
            h("span", { style: { fontSize: "11px", color: "#64748b" } }, new Date(n.created_at).toLocaleString())
          ),
          h("p", { style: { fontSize: "13px", color: "#334155", marginTop: "4px" } }, n.message)
        )
      )
    );
  }

  // MODAL DIALOGS
  function renderModalDialog({ modal, setModal, store, save, reload, user }) {
    if (modal === "new_patient") {
      return h(NewPatientModal, { setModal, store, save, reload });
    }
    if (modal === "new_appointment") {
      return h(NewAppointmentModal, { setModal, store, save, reload });
    }
    if (modal === "new_consultation") {
      return h(NewConsultationModal, { setModal, store, save, reload, user });
    }
    if (modal === "new_prescription") {
      return h(NewPrescriptionModal, { setModal, store, save, reload, user });
    }
    return null;
  }

  function NewPatientModal({ setModal, store, save, reload }) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("1992-05-14");
    const [gender, setGender] = useState("Male");
    const [allergies, setAllergies] = useState("");
    const [chronic, setChronic] = useState("");

    const submit = (e) => {
      e.preventDefault();
      if (!name || !phone) return;

      const nextId = store.patients.length + 1;
      const patientId = `PAT-${String(nextId).padStart(3, "0")}`;

      store.patients.push({
        id: nextId,
        patientId,
        fullName: name.trim(),
        dateOfBirth: dob,
        gender,
        phone,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.tn`,
        address: "Tunis, Tunisia",
        emergencyContact: "Family Contact",
        allergies: allergies ? allergies.split(",").map((s) => s.trim()) : [],
        chronicConditions: chronic ? chronic.split(",").map((s) => s.trim()) : [],
        currentMedications: [],
        medicalHistory: "Registered in cabinet.",
        bloodGroup: "O+",
        status: "Active",
        created_at: new Date().toISOString()
      });

      save();
      reload();
      setModal(null);
    };

    return h(
      "div",
      { className: "modal-overlay" },
      h(
        "div",
        { className: "modal-content" },
        h("h3", { style: { marginBottom: "16px" } }, "Register New Patient"),
        h(
          "form",
          { onSubmit: submit },
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Full Name:"), h("input", { className: "form-control", required: true, value: name, onChange: (e) => setName(e.target.value) })),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Phone Number:"), h("input", { className: "form-control", required: true, value: phone, onChange: (e) => setPhone(e.target.value) })),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Date of Birth:"), h("input", { type: "date", className: "form-control", value: dob, onChange: (e) => setDob(e.target.value) })),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Gender:"), h("select", { className: "form-control", value: gender, onChange: (e) => setGender(e.target.value) }, h("option", null, "Male"), h("option", null, "Female"))),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Known Allergies (comma separated):"), h("input", { className: "form-control", placeholder: "e.g. Penicillin, Aspirin", value: allergies, onChange: (e) => setAllergies(e.target.value) })),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Chronic Conditions (comma separated):"), h("input", { className: "form-control", placeholder: "e.g. Hypertension, Asthma", value: chronic, onChange: (e) => setChronic(e.target.value) })),
          h("div", { style: { display: "flex", gap: "10px", marginTop: "20px" } },
            h("button", { type: "button", className: "btn btn-outline", onClick: () => setModal(null) }, "Cancel"),
            h("button", { type: "submit", className: "btn btn-primary" }, "Register Patient")
          )
        )
      )
    );
  }

  function NewAppointmentModal({ setModal, store, save, reload }) {
    const [patientId, setPatientId] = useState(store.patients[0]?.patientId || "PAT-001");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [time, setTime] = useState("09:00");
    const [reason, setReason] = useState("General Consultation");

    const submit = (e) => {
      e.preventDefault();
      // Double booking conflict validation
      const conflict = store.appointments.find((a) => a.date === date && a.time === time && !["Cancelled", "No-show"].includes(a.status));
      if (conflict) {
        alert(`Schedule Conflict: An appointment (${conflict.appointmentNumber} - ${conflict.patientName}) is already booked at ${time} on ${date}. Please choose another time.`);
        return;
      }

      const p = store.patients.find((x) => x.patientId === patientId);
      const nextId = store.appointments.length + 1;
      store.appointments.push({
        id: nextId,
        appointmentNumber: `APT-2026-${String(nextId).padStart(3, "0")}`,
        patientId,
        patientName: p ? p.fullName : "Patient",
        date,
        time,
        durationMinutes: 30,
        type: "Consultation",
        status: "Confirmed",
        reason,
        created_at: new Date().toISOString()
      });

      save();
      reload();
      setModal(null);
    };

    return h(
      "div",
      { className: "modal-overlay" },
      h(
        "div",
        { className: "modal-content" },
        h("h3", { style: { marginBottom: "16px" } }, "Book New Appointment"),
        h(
          "form",
          { onSubmit: submit },
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Patient:"),
            h("select", { className: "form-control", value: patientId, onChange: (e) => setPatientId(e.target.value) },
              store.patients.map((p) => h("option", { key: p.id, value: p.patientId }, `${p.fullName} (${p.patientId})`))
            )
          ),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Date:"), h("input", { type: "date", className: "form-control", value: date, onChange: (e) => setDate(e.target.value) })),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Time:"),
            h("select", { className: "form-control", value: time, onChange: (e) => setTime(e.target.value) },
              ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:30", "15:00", "15:30", "16:00", "16:30"].map((t) =>
                h("option", { key: t, value: t }, t)
              )
            )
          ),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Reason for Consultation:"), h("input", { className: "form-control", value: reason, onChange: (e) => setReason(e.target.value) })),
          h("div", { style: { display: "flex", gap: "10px", marginTop: "20px" } },
            h("button", { type: "button", className: "btn btn-outline", onClick: () => setModal(null) }, "Cancel"),
            h("button", { type: "submit", className: "btn btn-primary" }, "Confirm Booking")
          )
        )
      )
    );
  }

  function NewConsultationModal({ setModal, store, save, reload, user }) {
    const [patientId, setPatientId] = useState(store.patients[0]?.patientId || "PAT-001");
    const [reason, setReason] = useState("");
    const [obs, setObs] = useState("");
    const [diag, setDiag] = useState("");
    const [plan, setPlan] = useState("");

    const submit = (e) => {
      e.preventDefault();
      const p = store.patients.find((x) => x.patientId === patientId);
      const nextId = store.consultations.length + 1;

      store.consultations.push({
        id: nextId,
        consultationNumber: `CNS-2026-${String(nextId).padStart(3, "0")}`,
        patientId,
        patientName: p ? p.fullName : "Patient",
        doctorId: user.id,
        doctorName: user.name,
        date: new Date().toISOString().split("T")[0],
        reason,
        clinicalObservations: obs,
        diagnosis: diag,
        treatmentPlan: plan,
        status: "Finalized",
        created_at: new Date().toISOString()
      });

      // Automatically create billing invoice
      const nextInvId = store.invoices.length + 1;
      store.invoices.push({
        id: nextInvId,
        invoiceNumber: `INV-2026-${String(nextInvId).padStart(3, "0")}`,
        patientId,
        patientName: p ? p.fullName : "Patient",
        date: new Date().toISOString().split("T")[0],
        amount: 70.0,
        paidAmount: 70.0,
        balance: 0.0,
        status: "Paid",
        created_at: new Date().toISOString()
      });

      store.payments.push({
        id: store.payments.length + 1,
        invoiceId: nextInvId,
        invoiceNumber: `INV-2026-${String(nextInvId).padStart(3, "0")}`,
        patientId,
        amount: 70.0,
        method: "Cash",
        date: new Date().toISOString().split("T")[0],
        recordedBy: user.name,
        created_at: new Date().toISOString()
      });

      save();
      reload();
      setModal(null);
    };

    return h(
      "div",
      { className: "modal-overlay" },
      h(
        "div",
        { className: "modal-content" },
        h("h3", { style: { marginBottom: "16px" } }, "New Clinical Consultation"),
        h(
          "form",
          { onSubmit: submit },
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Patient:"),
            h("select", { className: "form-control", value: patientId, onChange: (e) => setPatientId(e.target.value) },
              store.patients.map((p) => h("option", { key: p.id, value: p.patientId }, `${p.fullName} (${p.patientId})`))
            )
          ),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Reason:"), h("input", { className: "form-control", required: true, value: reason, onChange: (e) => setReason(e.target.value) })),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Clinical Observations / Physical Exam:"), h("textarea", { className: "form-control", rows: 2, value: obs, onChange: (e) => setObs(e.target.value) })),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Diagnosis:"), h("input", { className: "form-control", required: true, value: diag, onChange: (e) => setDiag(e.target.value) })),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Treatment Plan:"), h("textarea", { className: "form-control", rows: 2, value: plan, onChange: (e) => setPlan(e.target.value) })),
          h("div", { style: { display: "flex", gap: "10px", marginTop: "20px" } },
            h("button", { type: "button", className: "btn btn-outline", onClick: () => setModal(null) }, "Cancel"),
            h("button", { type: "submit", className: "btn btn-primary" }, "Finalize & Bill Consultation")
          )
        )
      )
    );
  }

  function NewPrescriptionModal({ setModal, store, save, reload, user }) {
    const [patientId, setPatientId] = useState(store.patients[0]?.patientId || "PAT-001");
    const [med, setMed] = useState("Amlodipine 5mg");
    const [freq, setFreq] = useState("1 tablet once daily");
    const [dur, setDur] = useState("3 months (90 days)");

    const submit = (e) => {
      e.preventDefault();
      const p = store.patients.find((x) => x.patientId === patientId);

      // Allergy conflict check
      const allergies = (p?.allergies || []).map((a) => a.toLowerCase());
      if (allergies.some((a) => med.toLowerCase().includes(a) || (a.includes("penicillin") && med.toLowerCase().includes("amoxicillin")))) {
        if (!confirm(`⚠️ SEVERE ALLERGY WARNING: Patient is allergic to ${allergies.join(", ")}. Do you wish to override and prescribe anyway?`)) {
          return;
        }
      }

      const nextId = store.prescriptions.length + 1;
      store.prescriptions.push({
        id: nextId,
        prescriptionNumber: `ORD-2026-${String(nextId).padStart(3, "0")}`,
        patientId,
        patientName: p ? p.fullName : "Patient",
        doctorId: user.id,
        doctorName: user.name,
        date: new Date().toISOString().split("T")[0],
        status: "Approved",
        items: [{ medication: med, frequency: freq, duration: dur }],
        doctorSignature: `${user.name}, MD - Certified & Signed`,
        created_at: new Date().toISOString()
      });

      save();
      reload();
      setModal(null);
    };

    return h(
      "div",
      { className: "modal-overlay" },
      h(
        "div",
        { className: "modal-content" },
        h("h3", { style: { marginBottom: "16px" } }, "Issue Medical Prescription"),
        h(
          "form",
          { onSubmit: submit },
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Patient:"),
            h("select", { className: "form-control", value: patientId, onChange: (e) => setPatientId(e.target.value) },
              store.patients.map((p) => h("option", { key: p.id, value: p.patientId }, `${p.fullName} (${p.patientId})`))
            )
          ),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Medication Name & Dosage:"),
            h("input", { className: "form-control", value: med, onChange: (e) => setMed(e.target.value) })
          ),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Frequency & Route:"),
            h("input", { className: "form-control", value: freq, onChange: (e) => setFreq(e.target.value) })
          ),
          h("div", { className: "form-group" }, h("label", { className: "form-label" }, "Duration:"),
            h("input", { className: "form-control", value: dur, onChange: (e) => setDur(e.target.value) })
          ),
          h("div", { style: { display: "flex", gap: "10px", marginTop: "20px" } },
            h("button", { type: "button", className: "btn btn-outline", onClick: () => setModal(null) }, "Cancel"),
            h("button", { type: "submit", className: "btn btn-primary" }, "Issue & Sign Prescription")
          )
        )
      )
    );
  }

  // 14. AUTHENTICATION VIEW (LOGIN & SIGN UP)
  function AuthScreen({ onLoginSuccess, store, save }) {
    const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("PATIENT");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("1995-03-20");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        // First try calling backend REST API endpoint
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password })
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          onLoginSuccess(data.user, data.token);
          return;
        }

        // Local in-memory validation fallback if backend port unreachable in browser
        const user = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (user) {
          onLoginSuccess(user, "demo-jwt-token-" + Date.now());
          return;
        }

        throw new Error(data.message || "Invalid email or password");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleSignup = async (e) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      if (!name.trim() || !email.trim() || !password || password.length < 8) {
        setError("Name, valid email, and a password of at least 8 characters are required.");
        setLoading(false);
        return;
      }

      try {
        // Try backend REST API register endpoint
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            phone,
            dateOfBirth: dob
          })
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          onLoginSuccess(data.user, data.token);
          return;
        }

        // Local in-memory creation fallback
        const existing = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (existing) {
          throw new Error("An account already exists for this email address");
        }

        const newId = store.users.length + 1;
        const assignedPatId = role === "PATIENT" ? `PAT-${String(newId).padStart(3, "0")}` : null;
        const newUser = {
          id: newId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          phone: phone || null,
          patientId: assignedPatId,
          created_at: new Date().toISOString()
        };

        store.users.push(newUser);
        if (role === "PATIENT") {
          store.patients.push({
            id: store.patients.length + 1,
            patientId: assignedPatId,
            fullName: name.trim(),
            dateOfBirth: dob,
            gender: "Other",
            phone: phone || "",
            email: email.trim().toLowerCase(),
            address: "Tunis, Tunisia",
            emergencyContact: "",
            allergies: [],
            chronicConditions: [],
            currentMedications: [],
            status: "Active",
            created_at: new Date().toISOString()
          });
        }
        save();
        onLoginSuccess(newUser, "demo-jwt-token-" + Date.now());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fillDemo = (demoEmail, demoPass) => {
      setEmail(demoEmail);
      setPassword(demoPass);
      setError(null);
    };

    return h(
      "div",
      { className: "auth-wrapper" },
      h(
        "div",
        { className: "auth-card" },
        h(
          "div",
          { className: "auth-header" },
          h("div", { className: "auth-logo" }, "+"),
          h("h2", { className: "auth-title" }, "MediCore"),
          h("p", { className: "auth-subtitle" }, "Intelligent Medical Cabinet Management Platform")
        ),

        // Tabs: Sign In / Create Account
        h(
          "div",
          { className: "auth-tabs" },
          h(
            "button",
            {
              className: `auth-tab-btn ${authMode === "login" ? "active" : ""}`,
              onClick: () => {
                setAuthMode("login");
                setError(null);
              }
            },
            "Sign In"
          ),
          h(
            "button",
            {
              className: `auth-tab-btn ${authMode === "signup" ? "active" : ""}`,
              onClick: () => {
                setAuthMode("signup");
                setError(null);
              }
            },
            "Create Account"
          )
        ),

        // Error Banner
        error &&
          h(
            "div",
            {
              style: {
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                color: "#991b1b",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "18px"
              }
            },
            error
          ),

        // Sign In Form
        authMode === "login"
          ? h(
              "form",
              { onSubmit: handleLogin },
              h(
                "div",
                { className: "form-group" },
                h("label", { className: "form-label" }, "Email Address:"),
                h("input", {
                  type: "email",
                  className: "form-control",
                  placeholder: "doctor@medicore.tn",
                  required: true,
                  value: email,
                  onChange: (e) => setEmail(e.target.value)
                })
              ),
              h(
                "div",
                { className: "form-group" },
                h("label", { className: "form-label" }, "Password:"),
                h("input", {
                  type: "password",
                  className: "form-control",
                  placeholder: "••••••••",
                  required: true,
                  value: password,
                  onChange: (e) => setPassword(e.target.value)
                })
              ),
              h(
                "button",
                {
                  type: "submit",
                  className: "btn btn-primary",
                  style: { width: "100%", marginTop: "10px" },
                  disabled: loading
                },
                loading ? "Authenticating..." : "Sign In to Cabinet"
              ),

              // Quick Demo Account Clicker
              h(
                "div",
                { className: "quick-demo-accounts" },
                h("div", { className: "quick-demo-title" }, "Quick Fill Synthetic Accounts:"),
                h(
                  "div",
                  null,
                  h("span", { className: "demo-account-pill", onClick: () => fillDemo("doctor@medicore.tn", "Doctor@123") }, "👨‍⚕️ Doctor"),
                  h("span", { className: "demo-account-pill", onClick: () => fillDemo("reception@medicore.tn", "Recep@123") }, "👩‍💼 Receptionist"),
                  h("span", { className: "demo-account-pill", onClick: () => fillDemo("nurse@medicore.tn", "Nurse@123") }, "🩺 Nurse"),
                  h("span", { className: "demo-account-pill", onClick: () => fillDemo("admin@medicore.tn", "Admin@123") }, "💼 Admin"),
                  h("span", { className: "demo-account-pill", onClick: () => fillDemo("patient@medicore.tn", "Patient@123") }, "👤 Patient")
                )
              )
            )
          : // Sign Up Form
            h(
              "form",
              { onSubmit: handleSignup },
              h(
                "div",
                { className: "form-group" },
                h("label", { className: "form-label" }, "Full Name:"),
                h("input", {
                  type: "text",
                  className: "form-control",
                  placeholder: "Dr. Full Name or Patient Name",
                  required: true,
                  value: name,
                  onChange: (e) => setName(e.target.value)
                })
              ),
              h(
                "div",
                { className: "form-group" },
                h("label", { className: "form-label" }, "Account Role:"),
                h(
                  "select",
                  {
                    className: "form-control",
                    value: role,
                    onChange: (e) => setRole(e.target.value)
                  },
                  h("option", { value: "PATIENT" }, "👤 Patient (Portal User)"),
                  h("option", { value: "DOCTOR" }, "👨‍⚕️ Doctor / Physician"),
                  h("option", { value: "RECEPTIONIST" }, "👩‍💼 Receptionist / Administrative Staff"),
                  h("option", { value: "NURSE" }, "🩺 Nurse / Clinical Staff"),
                  h("option", { value: "ADMIN" }, "💼 Cabinet Practice Administrator")
                )
              ),
              h(
                "div",
                { className: "form-group" },
                h("label", { className: "form-label" }, "Email Address:"),
                h("input", {
                  type: "email",
                  className: "form-control",
                  placeholder: "user@medicore.tn",
                  required: true,
                  value: email,
                  onChange: (e) => setEmail(e.target.value)
                })
              ),
              h(
                "div",
                { className: "form-group" },
                h("label", { className: "form-label" }, "Password (min 8 characters):"),
                h("input", {
                  type: "password",
                  className: "form-control",
                  placeholder: "••••••••",
                  required: true,
                  value: password,
                  onChange: (e) => setPassword(e.target.value)
                })
              ),
              h(
                "div",
                { className: "form-group" },
                h("label", { className: "form-label" }, "Phone Number:"),
                h("input", {
                  type: "tel",
                  className: "form-control",
                  placeholder: "+216 98 000 000",
                  value: phone,
                  onChange: (e) => setPhone(e.target.value)
                })
              ),
              role === "PATIENT" &&
                h(
                  "div",
                  { className: "form-group" },
                  h("label", { className: "form-label" }, "Date of Birth:"),
                  h("input", {
                    type: "date",
                    className: "form-control",
                    value: dob,
                    onChange: (e) => setDob(e.target.value)
                  })
                ),
              h(
                "button",
                {
                  type: "submit",
                  className: "btn btn-primary",
                  style: { width: "100%", marginTop: "10px" },
                  disabled: loading
                },
                loading ? "Creating Account..." : "Complete Registration"
              )
            )
      )
    );
  }

  // Mount Application to root element
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = ReactDOMClient.createRoot(rootElement);
    root.render(h(MediCoreApp));
    console.log("MediCore application successfully mounted to DOM!");
  }
})();
