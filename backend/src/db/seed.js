const crypto = require("crypto");
const db = require("../config/db");

const hashPassword = (password) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password, "medicore_salt_2026", 64, (err, val) =>
      err ? reject(err) : resolve(val.toString("hex"))
    )
  );

async function seedInitialData() {
  const users = db.table("users");
  if (users.length > 0) {
    return; // Already seeded
  }

  console.log("Seeding initial MediCore data...");

  // 1. Users
  const docHash = await hashPassword("Doctor@123");
  const recepHash = await hashPassword("Recep@123");
  const nurseHash = await hashPassword("Nurse@123");
  const adminHash = await hashPassword("Admin@123");
  const patHash = await hashPassword("Patient@123");

  const initialUsers = [
    {
      id: 1,
      name: "Dr. Selim Ammar",
      email: "doctor@medicore.tn",
      password_hash: docHash,
      role: "DOCTOR",
      specialty: "General Medicine & Cardiology",
      phone: "+216 98 123 456",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Amina Trabelsi",
      email: "reception@medicore.tn",
      password_hash: recepHash,
      role: "RECEPTIONIST",
      specialty: "Cabinet Administration",
      phone: "+216 22 234 567",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "Nour Ben Salah",
      email: "nurse@medicore.tn",
      password_hash: nurseHash,
      role: "NURSE",
      specialty: "Clinical Care",
      phone: "+216 55 345 678",
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: "Mohamed Ben Salem",
      email: "admin@medicore.tn",
      password_hash: adminHash,
      role: "ADMIN",
      specialty: "Practice Management",
      phone: "+216 20 456 789",
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: "Karim Mansour",
      email: "patient@medicore.tn",
      password_hash: patHash,
      role: "PATIENT",
      patientId: "PAT-001",
      phone: "+216 94 567 890",
      created_at: new Date().toISOString()
    }
  ];
  users.push(...initialUsers);

  // 2. Patients
  const patients = db.table("patients");
  const initialPatients = [
    {
      id: 1,
      patientId: "PAT-001",
      fullName: "Karim Mansour",
      dateOfBirth: "1982-04-15",
      gender: "Male",
      phone: "+216 94 567 890",
      email: "patient@medicore.tn",
      address: "22 Rue de Marseille, Tunis",
      emergencyContact: "Fatma Mansour (Spouse) - +216 94 567 899",
      allergies: ["Penicillin", "Dust Mites"],
      chronicConditions: ["Hypertension (Grade 1)", "Dyslipidemia"],
      currentMedications: ["Amlodipine 5mg QD", "Atorvastatin 20mg QHS"],
      medicalHistory: "Diagnosed with primary hypertension in 2021. Non-smoker, mild sedentary lifestyle.",
      bloodGroup: "O+",
      status: "Active",
      created_at: "2026-01-10T09:00:00Z"
    },
    {
      id: 2,
      patientId: "PAT-002",
      fullName: "Leila Ayadi",
      dateOfBirth: "1991-08-22",
      gender: "Female",
      phone: "+216 23 456 781",
      email: "leila.ayadi@gmail.com",
      address: "15 Rue Ibn Khaldoun, Ariana",
      emergencyContact: "Tarek Ayadi (Brother) - +216 23 456 782",
      allergies: ["Aspirin", "NSAIDs"],
      chronicConditions: ["Bronchial Asthma (Moderate persistent)"],
      currentMedications: ["Budesonide/Formoterol inhaler 160/4.5mcg BID"],
      medicalHistory: "Childhood asthma. Hospitalized once for acute exacerbation in 2023.",
      bloodGroup: "A+",
      status: "Active",
      created_at: "2026-02-01T10:15:00Z"
    },
    {
      id: 3,
      patientId: "PAT-003",
      fullName: "Youssef Gharbi",
      dateOfBirth: "1965-11-30",
      gender: "Male",
      phone: "+216 50 112 233",
      email: "y.gharbi@topnet.tn",
      address: "8 Avenue Habib Bourguiba, La Marsa",
      emergencyContact: "Sonia Gharbi (Daughter) - +216 50 112 234",
      allergies: ["None reported"],
      chronicConditions: ["Type 2 Diabetes Mellitus", "Mild Osteoarthritis"],
      currentMedications: ["Metformin 850mg BID", "Glimepiride 2mg QD"],
      medicalHistory: "Diabetes diagnosed 10 years ago. HbA1c currently around 7.4%. Regular foot checks.",
      bloodGroup: "B+",
      status: "Active",
      created_at: "2026-02-15T11:30:00Z"
    },
    {
      id: 4,
      patientId: "PAT-004",
      fullName: "Meriem Jaziri",
      dateOfBirth: "1998-03-05",
      gender: "Female",
      phone: "+216 97 889 900",
      email: "meriem.j@outlook.com",
      address: "4 Rue d'Alger, Menzah 6",
      emergencyContact: "Khaled Jaziri (Father) - +216 97 889 901",
      allergies: ["Sulfonamides"],
      chronicConditions: ["Migraine with aura"],
      currentMedications: ["Sumatriptan 50mg PRN"],
      medicalHistory: "Episodic migraines triggered by stress and sleep deprivation. Normal MRI brain (2025).",
      bloodGroup: "AB+",
      status: "Active",
      created_at: "2026-03-01T14:00:00Z"
    }
  ];
  patients.push(...initialPatients);

  // 3. Appointments
  const appointments = db.table("appointments");
  const today = new Date().toISOString().split("T")[0];
  const initialAppointments = [
    {
      id: 1,
      appointmentNumber: "APT-2026-001",
      patientId: "PAT-001",
      patientName: "Karim Mansour",
      doctorId: 1,
      doctorName: "Dr. Selim Ammar",
      date: today,
      time: "09:00",
      durationMinutes: 30,
      type: "Follow-up",
      status: "Arrived",
      reason: "Cardiovascular check-up and blood pressure assessment",
      priority: "Normal",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      appointmentNumber: "APT-2026-002",
      patientId: "PAT-002",
      patientName: "Leila Ayadi",
      doctorId: 1,
      doctorName: "Dr. Selim Ammar",
      date: today,
      time: "10:00",
      durationMinutes: 30,
      type: "Consultation",
      status: "Confirmed",
      reason: "Respiratory discomfort and seasonal cough",
      priority: "High",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      appointmentNumber: "APT-2026-003",
      patientId: "PAT-003",
      patientName: "Youssef Gharbi",
      doctorId: 1,
      doctorName: "Dr. Selim Ammar",
      date: today,
      time: "11:30",
      durationMinutes: 45,
      type: "Consultation",
      status: "Pending",
      reason: "Review HbA1c laboratory results and renal profile",
      priority: "Normal",
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      appointmentNumber: "APT-2026-004",
      patientId: "PAT-004",
      patientName: "Meriem Jaziri",
      doctorId: 1,
      doctorName: "Dr. Selim Ammar",
      date: today,
      time: "14:30",
      durationMinutes: 30,
      type: "Consultation",
      status: "Confirmed",
      reason: "Frequent headache episodes over past two weeks",
      priority: "Normal",
      created_at: new Date().toISOString()
    }
  ];
  appointments.push(...initialAppointments);

  // 4. Consultations
  const consultations = db.table("consultations");
  const initialConsultations = [
    {
      id: 1,
      consultationNumber: "CNS-2026-001",
      patientId: "PAT-001",
      patientName: "Karim Mansour",
      doctorId: 1,
      doctorName: "Dr. Selim Ammar",
      date: "2026-02-10",
      reason: "Hypertension quarterly surveillance",
      symptoms: "Mild morning occipital headache, no chest pain, no palpitations.",
      clinicalObservations: "Patient appears well, alert, oriented x3. Heart sounds S1, S2 regular, no murmurs. Lungs clear to auscultation bilaterally.",
      vitalSigns: {
        bloodPressure: "138/85 mmHg",
        heartRate: "72 bpm",
        temperature: "36.8 °C",
        respiratoryRate: "16 bpm",
        spO2: "98%",
        weight: "78 kg",
        height: "176 cm",
        bmi: "25.2"
      },
      diagnosis: "Controlled Essential Hypertension (ICD-10 I10)",
      treatmentPlan: "Maintain Amlodipine 5mg QD. Encourage 30 min daily walking, low sodium Mediterranean diet. Recheck lipid panel in 6 months.",
      status: "Finalized",
      amendments: [],
      created_at: "2026-02-10T09:30:00Z"
    }
  ];
  consultations.push(...initialConsultations);

  // 5. Prescriptions
  const prescriptions = db.table("prescriptions");
  const initialPrescriptions = [
    {
      id: 1,
      prescriptionNumber: "ORD-2026-001",
      patientId: "PAT-001",
      patientName: "Karim Mansour",
      doctorId: 1,
      doctorName: "Dr. Selim Ammar",
      consultationId: 1,
      date: "2026-02-10",
      status: "Approved",
      items: [
        {
          medication: "Amlodipine 5mg tablets",
          dosage: "5 mg",
          frequency: "1 tablet daily in the morning",
          duration: "3 months (90 days)",
          route: "Oral",
          instructions: "Take with or without food."
        },
        {
          medication: "Atorvastatin 20mg tablets",
          dosage: "20 mg",
          frequency: "1 tablet daily at bedtime",
          duration: "3 months (90 days)",
          route: "Oral",
          instructions: "Take in the evening with water."
        }
      ],
      warningsChecked: true,
      allergyCheckPassed: true,
      created_at: "2026-02-10T10:00:00Z"
    }
  ];
  prescriptions.push(...initialPrescriptions);

  // 6. Invoices & Payments
  const invoices = db.table("invoices");
  const payments = db.table("payments");
  const initialInvoices = [
    {
      id: 1,
      invoiceNumber: "INV-2026-001",
      patientId: "PAT-001",
      patientName: "Karim Mansour",
      date: "2026-02-10",
      amount: 70.0,
      paidAmount: 70.0,
      balance: 0.0,
      status: "Paid",
      paymentMethod: "Cash",
      items: [
        { description: "General Medical Consultation & Cardiovascular Check", fee: 70.0 }
      ],
      created_at: "2026-02-10T10:15:00Z"
    },
    {
      id: 2,
      invoiceNumber: "INV-2026-002",
      patientId: "PAT-003",
      patientName: "Youssef Gharbi",
      date: "2026-03-01",
      amount: 70.0,
      paidAmount: 30.0,
      balance: 40.0,
      status: "Partially Paid",
      paymentMethod: "Cash",
      items: [
        { description: "Endocrine & Diabetes Surveillance Consultation", fee: 70.0 }
      ],
      created_at: "2026-03-01T12:00:00Z"
    }
  ];
  invoices.push(...initialInvoices);

  payments.push(
    {
      id: 1,
      invoiceId: 1,
      invoiceNumber: "INV-2026-001",
      patientId: "PAT-001",
      amount: 70.0,
      method: "Cash",
      date: "2026-02-10",
      recordedBy: "Amina Trabelsi (Receptionist)",
      created_at: "2026-02-10T10:15:00Z"
    },
    {
      id: 2,
      invoiceId: 2,
      invoiceNumber: "INV-2026-002",
      patientId: "PAT-003",
      amount: 30.0,
      method: "Cash",
      date: "2026-03-01",
      recordedBy: "Amina Trabelsi (Receptionist)",
      created_at: "2026-03-01T12:05:00Z"
    }
  );

  // 7. Inventory
  const inventory = db.table("inventory");
  const initialInventory = [
    {
      id: 1,
      code: "MED-001",
      name: "Latex Examination Gloves (Box of 100)",
      category: "Consumables",
      currentStock: 4,
      minimumStock: 10,
      unit: "Boxes",
      supplier: "Pharmatec Tunisie",
      expirationDate: "2027-12-31",
      costPerUnit: 18.5,
      alert: "LOW_STOCK"
    },
    {
      id: 2,
      code: "MED-002",
      name: "Surgical Face Masks 3-Ply (Box of 50)",
      category: "Protection",
      currentStock: 18,
      minimumStock: 5,
      unit: "Boxes",
      supplier: "Pharmatec Tunisie",
      expirationDate: "2028-06-30",
      costPerUnit: 12.0,
      alert: "NORMAL"
    },
    {
      id: 3,
      code: "MED-003",
      name: "Sterile Disposable Syringes 5ml (Box of 100)",
      category: "Consumables",
      currentStock: 25,
      minimumStock: 8,
      unit: "Boxes",
      supplier: "Socomed Maghreb",
      expirationDate: "2028-01-15",
      costPerUnit: 24.0,
      alert: "NORMAL"
    },
    {
      id: 4,
      code: "MED-004",
      name: "Hydroalcoholic Antiseptic Gel 1L",
      category: "Disinfectants",
      currentStock: 2,
      minimumStock: 5,
      unit: "Bottles",
      supplier: "Socomed Maghreb",
      expirationDate: "2027-04-20",
      costPerUnit: 14.5,
      alert: "LOW_STOCK"
    },
    {
      id: 5,
      code: "MED-005",
      name: "Digital ECG Thermal Paper Rolls",
      category: "Medical Equipment",
      currentStock: 8,
      minimumStock: 3,
      unit: "Rolls",
      supplier: "Biomedical Systems Tunis",
      expirationDate: "2029-12-31",
      costPerUnit: 8.0,
      alert: "NORMAL"
    }
  ];
  inventory.push(...initialInventory);

  // 8. Laboratories
  const laboratories = db.table("laboratories");
  laboratories.push(
    {
      id: 1,
      requestNumber: "LAB-2026-001",
      patientId: "PAT-003",
      patientName: "Youssef Gharbi",
      doctorName: "Dr. Selim Ammar",
      examinationType: "Comprehensive Metabolic Panel, HbA1c & Lipid Profile",
      requestDate: "2026-03-01",
      status: "Completed",
      resultSummary: "HbA1c: 7.2% (improved). Fasting Glucose: 6.8 mmol/L. Total Cholesterol: 4.9 mmol/L. Creatinine: 82 umol/L (Normal eGFR).",
      reviewedByDoctor: true,
      created_at: "2026-03-01T12:00:00Z"
    },
    {
      id: 2,
      requestNumber: "LAB-2026-002",
      patientId: "PAT-001",
      patientName: "Karim Mansour",
      doctorName: "Dr. Selim Ammar",
      examinationType: "Renal Function Panel & Serum Electrolytes (Na, K)",
      requestDate: "2026-03-10",
      status: "In Progress",
      resultSummary: "Pending laboratory transmission from Laboratoire Ibn Zohr",
      reviewedByDoctor: false,
      created_at: "2026-03-10T09:30:00Z"
    }
  );

  // 9. Notifications
  const notifications = db.table("notifications");
  notifications.push(
    {
      id: 1,
      userId: 1,
      title: "Patient Arrived in Waiting Room",
      message: "Karim Mansour (PAT-001) has arrived for the 09:00 appointment.",
      type: "PATIENT_ARRIVAL",
      data: { appointmentId: 1, patientId: "PAT-001" },
      is_read: false,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      userId: 1,
      title: "Low Inventory Alert",
      message: "Latex Examination Gloves are running low (4 boxes left, minimum required: 10).",
      type: "LOW_INVENTORY",
      data: { inventoryId: 1, itemCode: "MED-001" },
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      userId: 2,
      title: "Upcoming Appointment in 30 Minutes",
      message: "Leila Ayadi has a confirmed consultation scheduled at 10:00.",
      type: "UPCOMING_APPOINTMENT",
      data: { appointmentId: 2 },
      is_read: false,
      created_at: new Date().toISOString()
    }
  );

  // 10. Audit Logs
  const auditLogs = db.table("audit_logs");
  auditLogs.push(
    {
      id: 1,
      userId: 1,
      userName: "Dr. Selim Ammar",
      role: "DOCTOR",
      action: "PATIENT_RECORD_VIEW",
      resource: "patients/PAT-001",
      ip: "127.0.0.1",
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 2,
      userId: 1,
      userName: "Dr. Selim Ammar",
      role: "DOCTOR",
      action: "CONSULTATION_FINALIZE",
      resource: "consultations/CNS-2026-001",
      ip: "127.0.0.1",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  );

  db.save();
  console.log("Seeding complete. Initial records created.");
}

module.exports = { seedInitialData, hashPassword };
