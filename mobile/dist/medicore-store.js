// MediCore Client Data Store
window.MEDICORE_INITIAL_DATA = {
  "users": [
    {
      "id": 1,
      "name": "Dr. Selim Ammar",
      "email": "doctor@medicore.tn",
      "password_hash": "dcc64388bf48b7e385bc1f3e49b9972b47efafa20fa197709fc6223b92b3b31c24d1d5c3c711db0dc56277521155bb4371df77f03f23216c66e70fec33a4a734",
      "role": "DOCTOR",
      "specialty": "General Medicine & Cardiology",
      "phone": "+216 98 123 456",
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 2,
      "name": "Amina Trabelsi",
      "email": "reception@medicore.tn",
      "password_hash": "261bb753e0f3cc34d7bfedd15d796b37fed8f44c2c367b971b507c2f6b93631ea8a4d645162283ce29e06de34a13d16ba22b4f43399757ba2a00e2437fc5f8bd",
      "role": "RECEPTIONIST",
      "specialty": "Cabinet Administration",
      "phone": "+216 22 234 567",
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 3,
      "name": "Nour Ben Salah",
      "email": "nurse@medicore.tn",
      "password_hash": "65fe7248ba091774463288266ba7df865099add15cc0a95bcdb12a4198043b45213c0c925ce0d1edcaae6a2df4e8b388a609aa43f1323d3f73c2a085c896bd7e",
      "role": "NURSE",
      "specialty": "Clinical Care",
      "phone": "+216 55 345 678",
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 4,
      "name": "Mohamed Ben Salem",
      "email": "admin@medicore.tn",
      "password_hash": "0b1ce416892a9225fe9546c4f6f5ef1893f80bc2c4bac5b06b5b718312bd44c7fc2d23ade02bdff812b735a5a8b6d4557db9c072d530006814f8a2f51c81ed0d",
      "role": "ADMIN",
      "specialty": "Practice Management",
      "phone": "+216 20 456 789",
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 5,
      "name": "Karim Mansour",
      "email": "patient@medicore.tn",
      "password_hash": "7518d2705c20d56ebcd31f767e2ae61c89b88e28da2df1f87565641de7738edc8f896c055d07aab2f0a356847d2e838ac22f8aa76edcd27ead5c889644ea29fe",
      "role": "PATIENT",
      "patientId": "PAT-001",
      "phone": "+216 94 567 890",
      "created_at": "2026-11-15T15:49:57.069Z"
    }
  ],
  "patients": [
    {
      "id": 1,
      "patientId": "PAT-001",
      "fullName": "Karim Mansour",
      "dateOfBirth": "1982-04-15",
      "gender": "Male",
      "phone": "+216 94 567 890",
      "email": "patient@medicore.tn",
      "address": "22 Rue de Marseille, Tunis",
      "emergencyContact": "Fatma Mansour (Spouse) - +216 94 567 899",
      "allergies": [
        "Penicillin",
        "Dust Mites"
      ],
      "chronicConditions": [
        "Hypertension (Grade 1)",
        "Dyslipidemia"
      ],
      "currentMedications": [
        "Amlodipine 5mg QD",
        "Atorvastatin 20mg QHS"
      ],
      "medicalHistory": "Diagnosed with primary hypertension in 2021. Non-smoker, mild sedentary lifestyle.",
      "bloodGroup": "O+",
      "status": "Active",
      "created_at": "2026-01-10T09:00:00Z"
    },
    {
      "id": 2,
      "patientId": "PAT-002",
      "fullName": "Leila Ayadi",
      "dateOfBirth": "1991-08-22",
      "gender": "Female",
      "phone": "+216 23 456 781",
      "email": "leila.ayadi@gmail.com",
      "address": "15 Rue Ibn Khaldoun, Ariana",
      "emergencyContact": "Tarek Ayadi (Brother) - +216 23 456 782",
      "allergies": [
        "Aspirin",
        "NSAIDs"
      ],
      "chronicConditions": [
        "Bronchial Asthma (Moderate persistent)"
      ],
      "currentMedications": [
        "Budesonide/Formoterol inhaler 160/4.5mcg BID"
      ],
      "medicalHistory": "Childhood asthma. Hospitalized once for acute exacerbation in 2023.",
      "bloodGroup": "A+",
      "status": "Active",
      "created_at": "2026-02-01T10:15:00Z"
    },
    {
      "id": 3,
      "patientId": "PAT-003",
      "fullName": "Youssef Gharbi",
      "dateOfBirth": "1965-11-30",
      "gender": "Male",
      "phone": "+216 50 112 233",
      "email": "y.gharbi@topnet.tn",
      "address": "8 Avenue Habib Bourguiba, La Marsa",
      "emergencyContact": "Sonia Gharbi (Daughter) - +216 50 112 234",
      "allergies": [
        "None reported"
      ],
      "chronicConditions": [
        "Type 2 Diabetes Mellitus",
        "Mild Osteoarthritis"
      ],
      "currentMedications": [
        "Metformin 850mg BID",
        "Glimepiride 2mg QD"
      ],
      "medicalHistory": "Diabetes diagnosed 10 years ago. HbA1c currently around 7.4%. Regular foot checks.",
      "bloodGroup": "B+",
      "status": "Active",
      "created_at": "2026-02-15T11:30:00Z"
    },
    {
      "id": 4,
      "patientId": "PAT-004",
      "fullName": "Meriem Jaziri",
      "dateOfBirth": "1998-03-05",
      "gender": "Female",
      "phone": "+216 97 889 900",
      "email": "meriem.j@outlook.com",
      "address": "4 Rue d'Alger, Menzah 6",
      "emergencyContact": "Khaled Jaziri (Father) - +216 97 889 901",
      "allergies": [
        "Sulfonamides"
      ],
      "chronicConditions": [
        "Migraine with aura"
      ],
      "currentMedications": [
        "Sumatriptan 50mg PRN"
      ],
      "medicalHistory": "Episodic migraines triggered by stress and sleep deprivation. Normal MRI brain (2025).",
      "bloodGroup": "AB+",
      "status": "Active",
      "created_at": "2026-03-01T14:00:00Z"
    },
    {
      "id": 5,
      "patientId": "PAT-005",
      "fullName": "Sami Khemir",
      "dateOfBirth": "1988-06-12",
      "gender": "Male",
      "phone": "+216 99 888 777",
      "email": "",
      "address": "Carthage Byrsa",
      "emergencyContact": "",
      "allergies": [],
      "chronicConditions": [],
      "currentMedications": [],
      "medicalHistory": "Registered in cabinet.",
      "bloodGroup": "Unknown",
      "status": "Active",
      "created_at": "2026-11-15T15:50:50.176Z"
    }
  ],
  "appointments": [
    {
      "id": 1,
      "appointmentNumber": "APT-2026-001",
      "patientId": "PAT-001",
      "patientName": "Karim Mansour",
      "doctorId": 1,
      "doctorName": "Dr. Selim Ammar",
      "date": "2026-11-15",
      "time": "09:00",
      "durationMinutes": 30,
      "type": "Follow-up",
      "status": "Arrived",
      "reason": "Cardiovascular check-up and blood pressure assessment",
      "priority": "Normal",
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 2,
      "appointmentNumber": "APT-2026-002",
      "patientId": "PAT-002",
      "patientName": "Leila Ayadi",
      "doctorId": 1,
      "doctorName": "Dr. Selim Ammar",
      "date": "2026-11-15",
      "time": "10:00",
      "durationMinutes": 30,
      "type": "Consultation",
      "status": "Confirmed",
      "reason": "Respiratory discomfort and seasonal cough",
      "priority": "High",
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 3,
      "appointmentNumber": "APT-2026-003",
      "patientId": "PAT-003",
      "patientName": "Youssef Gharbi",
      "doctorId": 1,
      "doctorName": "Dr. Selim Ammar",
      "date": "2026-11-15",
      "time": "11:30",
      "durationMinutes": 45,
      "type": "Consultation",
      "status": "Pending",
      "reason": "Review HbA1c laboratory results and renal profile",
      "priority": "Normal",
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 4,
      "appointmentNumber": "APT-2026-004",
      "patientId": "PAT-004",
      "patientName": "Meriem Jaziri",
      "doctorId": 1,
      "doctorName": "Dr. Selim Ammar",
      "date": "2026-11-15",
      "time": "14:30",
      "durationMinutes": 30,
      "type": "Consultation",
      "status": "Confirmed",
      "reason": "Frequent headache episodes over past two weeks",
      "priority": "Normal",
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 5,
      "appointmentNumber": "APT-2026-005",
      "patientId": "PAT-005",
      "patientName": "Sami Khemir",
      "doctorId": 1,
      "doctorName": "Dr. Selim Ammar",
      "date": "2026-11-20",
      "time": "08:30",
      "durationMinutes": 30,
      "type": "Consultation",
      "status": "Confirmed",
      "reason": "General checkup",
      "priority": "Normal",
      "created_at": "2026-11-15T15:50:50.185Z"
    }
  ],
  "consultations": [
    {
      "id": 1,
      "consultationNumber": "CNS-2026-001",
      "patientId": "PAT-001",
      "patientName": "Karim Mansour",
      "doctorId": 1,
      "doctorName": "Dr. Selim Ammar",
      "date": "2026-02-10",
      "reason": "Hypertension quarterly surveillance",
      "symptoms": "Mild morning occipital headache, no chest pain, no palpitations.",
      "clinicalObservations": "Patient appears well, alert, oriented x3. Heart sounds S1, S2 regular, no murmurs. Lungs clear to auscultation bilaterally.",
      "vitalSigns": {
        "bloodPressure": "138/85 mmHg",
        "heartRate": "72 bpm",
        "temperature": "36.8 °C",
        "respiratoryRate": "16 bpm",
        "spO2": "98%",
        "weight": "78 kg",
        "height": "176 cm",
        "bmi": "25.2"
      },
      "diagnosis": "Controlled Essential Hypertension (ICD-10 I10)",
      "treatmentPlan": "Maintain Amlodipine 5mg QD. Encourage 30 min daily walking, low sodium Mediterranean diet. Recheck lipid panel in 6 months.",
      "status": "Finalized",
      "amendments": [],
      "created_at": "2026-02-10T09:30:00Z"
    },
    {
      "id": 2,
      "consultationNumber": "CNS-2026-002",
      "patientId": "PAT-001",
      "patientName": "Karim Mansour",
      "doctorId": 1,
      "doctorName": "Dr. Selim Ammar",
      "appointmentId": null,
      "date": "2026-11-15",
      "reason": "Cardio review",
      "symptoms": "Mild fatigue",
      "clinicalObservations": "BP 130/80",
      "vitalSigns": {
        "bloodPressure": "",
        "heartRate": "",
        "temperature": "",
        "respiratoryRate": "",
        "spO2": "",
        "weight": "",
        "height": "",
        "bmi": ""
      },
      "diagnosis": "Stable hypertension",
      "treatmentPlan": "Maintain Amlodipine",
      "status": "Finalized",
      "amendments": [],
      "created_at": "2026-11-15T15:50:50.193Z"
    }
  ],
  "prescriptions": [
    {
      "id": 1,
      "prescriptionNumber": "ORD-2026-001",
      "patientId": "PAT-001",
      "patientName": "Karim Mansour",
      "doctorId": 1,
      "doctorName": "Dr. Selim Ammar",
      "consultationId": 1,
      "date": "2026-02-10",
      "status": "Approved",
      "items": [
        {
          "medication": "Amlodipine 5mg tablets",
          "dosage": "5 mg",
          "frequency": "1 tablet daily in the morning",
          "duration": "3 months (90 days)",
          "route": "Oral",
          "instructions": "Take with or without food."
        },
        {
          "medication": "Atorvastatin 20mg tablets",
          "dosage": "20 mg",
          "frequency": "1 tablet daily at bedtime",
          "duration": "3 months (90 days)",
          "route": "Oral",
          "instructions": "Take in the evening with water."
        }
      ],
      "warningsChecked": true,
      "allergyCheckPassed": true,
      "created_at": "2026-02-10T10:00:00Z"
    },
    {
      "id": 2,
      "prescriptionNumber": "ORD-2026-002",
      "patientId": "PAT-001",
      "patientName": "Karim Mansour",
      "doctorId": 1,
      "doctorName": "Dr. Selim Ammar",
      "consultationId": 2,
      "date": "2026-11-15",
      "status": "Approved",
      "items": [
        {
          "medication": "Amlodipine 5mg",
          "dosage": "5mg",
          "frequency": "QD",
          "duration": "90 days"
        }
      ],
      "allergyCheckPassed": true,
      "warnings": [],
      "doctorSignature": "Dr. Selim Ammar, MD - Verified & Digitally Signed",
      "created_at": "2026-11-15T15:50:50.200Z"
    }
  ],
  "documents": [],
  "invoices": [
    {
      "id": 1,
      "invoiceNumber": "INV-2026-001",
      "patientId": "PAT-001",
      "patientName": "Karim Mansour",
      "date": "2026-02-10",
      "amount": 70,
      "paidAmount": 70,
      "balance": 0,
      "status": "Paid",
      "paymentMethod": "Cash",
      "items": [
        {
          "description": "General Medical Consultation & Cardiovascular Check",
          "fee": 70
        }
      ],
      "created_at": "2026-02-10T10:15:00Z"
    },
    {
      "id": 2,
      "invoiceNumber": "INV-2026-002",
      "patientId": "PAT-003",
      "patientName": "Youssef Gharbi",
      "date": "2026-03-01",
      "amount": 70,
      "paidAmount": 30,
      "balance": 40,
      "status": "Partially Paid",
      "paymentMethod": "Cash",
      "items": [
        {
          "description": "Endocrine & Diabetes Surveillance Consultation",
          "fee": 70
        }
      ],
      "created_at": "2026-03-01T12:00:00Z"
    },
    {
      "id": 3,
      "invoiceNumber": "INV-2026-003",
      "patientId": "PAT-001",
      "patientName": "Karim Mansour",
      "consultationId": null,
      "date": "2026-11-15",
      "amount": 70,
      "paidAmount": 70,
      "balance": 0,
      "status": "Paid",
      "paymentMethod": "Cash",
      "currency": "TND",
      "items": [
        {
          "description": "Cardio Consultation",
          "fee": 70
        }
      ],
      "created_at": "2026-11-15T15:50:50.204Z"
    }
  ],
  "payments": [
    {
      "id": 1,
      "invoiceId": 1,
      "invoiceNumber": "INV-2026-001",
      "patientId": "PAT-001",
      "amount": 70,
      "method": "Cash",
      "date": "2026-02-10",
      "recordedBy": "Amina Trabelsi (Receptionist)",
      "created_at": "2026-02-10T10:15:00Z"
    },
    {
      "id": 2,
      "invoiceId": 2,
      "invoiceNumber": "INV-2026-002",
      "patientId": "PAT-003",
      "amount": 30,
      "method": "Cash",
      "date": "2026-03-01",
      "recordedBy": "Amina Trabelsi (Receptionist)",
      "created_at": "2026-03-01T12:05:00Z"
    },
    {
      "id": 3,
      "invoiceId": 3,
      "invoiceNumber": "INV-2026-003",
      "patientId": "PAT-001",
      "amount": 70,
      "method": "Cash",
      "date": "2026-11-15",
      "recordedBy": "Amina Trabelsi",
      "created_at": "2026-11-15T15:50:50.204Z"
    }
  ],
  "expenses": [],
  "staff": [],
  "laboratories": [
    {
      "id": 1,
      "requestNumber": "LAB-2026-001",
      "patientId": "PAT-003",
      "patientName": "Youssef Gharbi",
      "doctorName": "Dr. Selim Ammar",
      "examinationType": "Comprehensive Metabolic Panel, HbA1c & Lipid Profile",
      "requestDate": "2026-03-01",
      "status": "Completed",
      "resultSummary": "HbA1c: 7.2% (improved). Fasting Glucose: 6.8 mmol/L. Total Cholesterol: 4.9 mmol/L. Creatinine: 82 umol/L (Normal eGFR).",
      "reviewedByDoctor": true,
      "created_at": "2026-03-01T12:00:00Z"
    },
    {
      "id": 2,
      "requestNumber": "LAB-2026-002",
      "patientId": "PAT-001",
      "patientName": "Karim Mansour",
      "doctorName": "Dr. Selim Ammar",
      "examinationType": "Renal Function Panel & Serum Electrolytes (Na, K)",
      "requestDate": "2026-03-10",
      "status": "In Progress",
      "resultSummary": "Pending laboratory transmission from Laboratoire Ibn Zohr",
      "reviewedByDoctor": false,
      "created_at": "2026-03-10T09:30:00Z"
    }
  ],
  "inventory": [
    {
      "id": 1,
      "code": "MED-001",
      "name": "Latex Examination Gloves (Box of 100)",
      "category": "Consumables",
      "currentStock": 4,
      "minimumStock": 10,
      "unit": "Boxes",
      "supplier": "Pharmatec Tunisie",
      "expirationDate": "2027-12-31",
      "costPerUnit": 18.5,
      "alert": "LOW_STOCK"
    },
    {
      "id": 2,
      "code": "MED-002",
      "name": "Surgical Face Masks 3-Ply (Box of 50)",
      "category": "Protection",
      "currentStock": 18,
      "minimumStock": 5,
      "unit": "Boxes",
      "supplier": "Pharmatec Tunisie",
      "expirationDate": "2028-06-30",
      "costPerUnit": 12,
      "alert": "NORMAL"
    },
    {
      "id": 3,
      "code": "MED-003",
      "name": "Sterile Disposable Syringes 5ml (Box of 100)",
      "category": "Consumables",
      "currentStock": 25,
      "minimumStock": 8,
      "unit": "Boxes",
      "supplier": "Socomed Maghreb",
      "expirationDate": "2028-01-15",
      "costPerUnit": 24,
      "alert": "NORMAL"
    },
    {
      "id": 4,
      "code": "MED-004",
      "name": "Hydroalcoholic Antiseptic Gel 1L",
      "category": "Disinfectants",
      "currentStock": 2,
      "minimumStock": 5,
      "unit": "Bottles",
      "supplier": "Socomed Maghreb",
      "expirationDate": "2027-04-20",
      "costPerUnit": 14.5,
      "alert": "LOW_STOCK"
    },
    {
      "id": 5,
      "code": "MED-005",
      "name": "Digital ECG Thermal Paper Rolls",
      "category": "Medical Equipment",
      "currentStock": 8,
      "minimumStock": 3,
      "unit": "Rolls",
      "supplier": "Biomedical Systems Tunis",
      "expirationDate": "2029-12-31",
      "costPerUnit": 8,
      "alert": "NORMAL"
    }
  ],
  "inventory_movements": [],
  "notifications": [
    {
      "id": 1,
      "userId": 1,
      "title": "Patient Arrived in Waiting Room",
      "message": "Karim Mansour (PAT-001) has arrived for the 09:00 appointment.",
      "type": "PATIENT_ARRIVAL",
      "data": {
        "appointmentId": 1,
        "patientId": "PAT-001"
      },
      "is_read": false,
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 2,
      "userId": 1,
      "title": "Low Inventory Alert",
      "message": "Latex Examination Gloves are running low (4 boxes left, minimum required: 10).",
      "type": "LOW_INVENTORY",
      "data": {
        "inventoryId": 1,
        "itemCode": "MED-001"
      },
      "is_read": false,
      "created_at": "2026-11-15T14:49:57.069Z"
    },
    {
      "id": 3,
      "userId": 2,
      "title": "Upcoming Appointment in 30 Minutes",
      "message": "Leila Ayadi has a confirmed consultation scheduled at 10:00.",
      "type": "UPCOMING_APPOINTMENT",
      "data": {
        "appointmentId": 2
      },
      "is_read": false,
      "created_at": "2026-11-15T15:49:57.069Z"
    },
    {
      "id": 4,
      "userId": 1,
      "title": "New Appointment Booked",
      "message": "Sami Khemir booked a Consultation for 2026-11-20 at 08:30.",
      "type": "APPOINTMENT_CONFIRMATION",
      "data": {
        "appointmentId": 5,
        "appointmentNumber": "APT-2026-005"
      },
      "is_read": false,
      "created_at": "2026-11-15T15:50:50.185Z"
    }
  ],
  "audit_logs": [
    {
      "id": 1,
      "userId": 1,
      "userName": "Dr. Selim Ammar",
      "role": "DOCTOR",
      "action": "PATIENT_RECORD_VIEW",
      "resource": "patients/PAT-001",
      "ip": "127.0.0.1",
      "timestamp": "2026-11-15T13:49:57.069Z"
    },
    {
      "id": 2,
      "userId": 1,
      "userName": "Dr. Selim Ammar",
      "role": "DOCTOR",
      "action": "CONSULTATION_FINALIZE",
      "resource": "consultations/CNS-2026-001",
      "ip": "127.0.0.1",
      "timestamp": "2026-11-15T14:49:57.069Z"
    },
    {
      "id": 3,
      "userId": 2,
      "userName": "Amina Trabelsi",
      "role": "RECEPTIONIST",
      "action": "PATIENT_CREATE",
      "resource": "/api/patients",
      "method": "POST",
      "details": {},
      "ip": "127.0.0.1",
      "timestamp": "2026-11-15T15:50:50.179Z"
    },
    {
      "id": 4,
      "userId": 2,
      "userName": "Amina Trabelsi",
      "role": "RECEPTIONIST",
      "action": "APPOINTMENT_CREATE",
      "resource": "/api/appointments",
      "method": "POST",
      "details": {},
      "ip": "127.0.0.1",
      "timestamp": "2026-11-15T15:50:50.186Z"
    },
    {
      "id": 5,
      "userId": 1,
      "userName": "Dr. Selim Ammar",
      "role": "DOCTOR",
      "action": "CONSULTATION_CREATE",
      "resource": "/api/consultations",
      "method": "POST",
      "details": {},
      "ip": "127.0.0.1",
      "timestamp": "2026-11-15T15:50:50.193Z"
    },
    {
      "id": 6,
      "userId": 1,
      "userName": "Dr. Selim Ammar",
      "role": "DOCTOR",
      "action": "PRESCRIPTION_CREATE",
      "resource": "/api/prescriptions",
      "method": "POST",
      "details": {},
      "ip": "127.0.0.1",
      "timestamp": "2026-11-15T15:50:50.201Z"
    },
    {
      "id": 7,
      "userId": 2,
      "userName": "Amina Trabelsi",
      "role": "RECEPTIONIST",
      "action": "INVOICE_CREATE",
      "resource": "/api/billing/invoices",
      "method": "POST",
      "details": {},
      "ip": "127.0.0.1",
      "timestamp": "2026-11-15T15:50:50.205Z"
    },
    {
      "id": 8,
      "userId": 1,
      "userName": "Dr. Selim Ammar",
      "role": "DOCTOR",
      "action": "AI_ASSISTANT_QUERY",
      "resource": "/api/ai/ask",
      "method": "POST",
      "details": {},
      "ip": "127.0.0.1",
      "timestamp": "2026-11-15T15:50:50.212Z"
    }
  ],
  "ai_runs": [
    {
      "id": 1,
      "userId": 1,
      "userRole": "DOCTOR",
      "prompt": "Summarize patient Karim Mansour history",
      "toolUsed": "summarizePatientHistory",
      "toolParams": {
        "patientId": "PAT-001"
      },
      "timestamp": "2026-11-15T15:50:50.211Z"
    }
  ],
  "ai_tool_calls": [],
  "workflow_jobs": [],
  "cabinet_settings": {
    "name": "MediCore Medical Cabinet",
    "doctorName": "Dr. Selim Ammar, MD",
    "specialty": "General Medicine & Cardiology",
    "address": "14 Avenue Habib Bourguiba, Tunis 1001, Tunisia",
    "phone": "+216 71 889 000",
    "email": "contact@medicore.cabinet.tn",
    "currency": "TND",
    "consultationFee": 70,
    "workingHours": "08:30 - 18:00",
    "taxNumber": "MF-8492048-A"
  }
};
window.MEDICORE_STORE = JSON.parse(localStorage.getItem("medicore_cabinet_data") || "null") || window.MEDICORE_INITIAL_DATA;
window.saveMediCoreStore = function() { localStorage.setItem("medicore_cabinet_data", JSON.stringify(window.MEDICORE_STORE)); };
