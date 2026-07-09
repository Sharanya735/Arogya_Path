-- Seed sample data for testing

-- Insert sample doctors
INSERT INTO public.doctors (doctor_id, first_name, last_name, specialization, license_number, phone, email, department, consultation_fee, available_days, available_hours) VALUES
('D001', 'Dr. Rajesh', 'Kumar', 'Cardiology', 'LIC001', '+91-9876543210', 'rajesh.kumar@hospital.com', 'Cardiology', 1500.00, ARRAY['monday', 'tuesday', 'wednesday', 'friday'], '{"morning": "09:00-12:00", "evening": "16:00-19:00"}'),
('D002', 'Dr. Priya', 'Sharma', 'Pediatrics', 'LIC002', '+91-9876543211', 'priya.sharma@hospital.com', 'Pediatrics', 1200.00, ARRAY['monday', 'wednesday', 'thursday', 'saturday'], '{"morning": "08:00-12:00", "afternoon": "14:00-17:00"}'),
('D003', 'Dr. Amit', 'Singh', 'Orthopedics', 'LIC003', '+91-9876543212', 'amit.singh@hospital.com', 'Orthopedics', 1800.00, ARRAY['tuesday', 'thursday', 'friday', 'saturday'], '{"morning": "10:00-13:00", "evening": "15:00-18:00"}'),
('D004', 'Dr. Sunita', 'Patel', 'Dermatology', 'LIC004', '+91-9876543213', 'sunita.patel@hospital.com', 'Dermatology', 1000.00, ARRAY['monday', 'tuesday', 'thursday', 'friday'], '{"morning": "09:00-12:00", "afternoon": "14:00-17:00"}'),
('D005', 'Dr. Vikram', 'Gupta', 'Neurology', 'LIC005', '+91-9876543214', 'vikram.gupta@hospital.com', 'Neurology', 2000.00, ARRAY['wednesday', 'friday', 'saturday'], '{"morning": "08:00-11:00", "evening": "16:00-19:00"}');

-- Insert sample patients
INSERT INTO public.patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, medical_history, insurance_provider, insurance_number) VALUES
('P001', 'Ravi', 'Mehta', '1985-03-15', 'male', '+91-9123456789', 'ravi.mehta@email.com', '123 MG Road, Mumbai, Maharashtra', 'Sunita Mehta', '+91-9123456790', 'O+', 'None', 'Hypertension', 'Star Health Insurance', 'SHI123456'),
('P002', 'Anita', 'Joshi', '1990-07-22', 'female', '+91-9123456791', 'anita.joshi@email.com', '456 Park Street, Delhi', 'Raj Joshi', '+91-9123456792', 'A+', 'Penicillin', 'Diabetes Type 2', 'HDFC ERGO', 'HDFC789012'),
('P003', 'Kiran', 'Reddy', '1978-11-08', 'male', '+91-9123456793', 'kiran.reddy@email.com', '789 Brigade Road, Bangalore, Karnataka', 'Lakshmi Reddy', '+91-9123456794', 'B+', 'Dust allergy', 'Asthma', 'ICICI Lombard', 'ICICI345678'),
('P004', 'Meera', 'Nair', '1995-01-30', 'female', '+91-9123456795', 'meera.nair@email.com', '321 Marine Drive, Kochi, Kerala', 'Suresh Nair', '+91-9123456796', 'AB+', 'Shellfish', 'None', 'Bajaj Allianz', 'BAJAJ901234'),
('P005', 'Arjun', 'Kapoor', '1982-09-12', 'male', '+91-9123456797', 'arjun.kapoor@email.com', '654 CP, New Delhi', 'Kavita Kapoor', '+91-9123456798', 'O-', 'None', 'Migraine', 'Max Bupa', 'MAX567890');

-- Insert sample inventory items
INSERT INTO public.inventory (item_id, item_name, category, description, current_stock, minimum_stock, maximum_stock, unit_price, supplier, expiry_date, location) VALUES
('I001', 'Paracetamol 500mg', 'medication', 'Pain relief and fever reducer', 500, 50, 1000, 2.50, 'PharmaCorp Ltd', '2025-12-31', 'Pharmacy-A1'),
('I002', 'Amoxicillin 250mg', 'medication', 'Antibiotic capsules', 200, 30, 500, 15.00, 'MediSupply Inc', '2025-06-30', 'Pharmacy-A2'),
('I003', 'Digital Thermometer', 'equipment', 'Non-contact infrared thermometer', 25, 5, 50, 850.00, 'MedTech Solutions', NULL, 'Equipment-B1'),
('I004', 'Surgical Gloves (Box)', 'supplies', 'Latex-free disposable gloves', 100, 20, 200, 120.00, 'SafetyFirst Medical', NULL, 'Supply-C1'),
('I005', 'Insulin Pen', 'medication', 'Pre-filled insulin injection pen', 75, 10, 150, 450.00, 'DiabetesCare Ltd', '2025-09-15', 'Pharmacy-A3'),
('I006', 'Blood Pressure Monitor', 'equipment', 'Digital BP monitoring device', 15, 3, 30, 2500.00, 'HealthTech Pro', NULL, 'Equipment-B2'),
('I007', 'Bandages (Roll)', 'supplies', 'Elastic medical bandages', 150, 25, 300, 45.00, 'WoundCare Supplies', NULL, 'Supply-C2'),
('I008', 'Aspirin 75mg', 'medication', 'Low-dose aspirin tablets', 300, 40, 600, 8.50, 'CardioMed Pharma', '2025-11-20', 'Pharmacy-A4'),
('I009', 'Oxygen Mask', 'supplies', 'Disposable oxygen delivery mask', 80, 15, 160, 25.00, 'RespiratoryCare Inc', NULL, 'Supply-C3'),
('I010', 'ECG Machine', 'equipment', 'Portable electrocardiogram device', 3, 1, 5, 125000.00, 'CardioTech Systems', NULL, 'Equipment-B3');

-- Insert sample appointments (for next few days)
INSERT INTO public.appointments (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status, appointment_type, symptoms) VALUES
('A001', (SELECT id FROM patients WHERE patient_id = 'P001'), (SELECT id FROM doctors WHERE doctor_id = 'D001'), CURRENT_DATE + INTERVAL '1 day', '10:00', 'scheduled', 'consultation', 'Chest pain and shortness of breath'),
('A002', (SELECT id FROM patients WHERE patient_id = 'P002'), (SELECT id FROM doctors WHERE doctor_id = 'D002'), CURRENT_DATE + INTERVAL '2 days', '14:30', 'confirmed', 'follow-up', 'Routine diabetes check-up'),
('A003', (SELECT id FROM patients WHERE patient_id = 'P003'), (SELECT id FROM doctors WHERE doctor_id = 'D003'), CURRENT_DATE + INTERVAL '1 day', '16:00', 'scheduled', 'consultation', 'Knee pain after exercise'),
('A004', (SELECT id FROM patients WHERE patient_id = 'P004'), (SELECT id FROM doctors WHERE doctor_id = 'D004'), CURRENT_DATE + INTERVAL '3 days', '11:00', 'scheduled', 'consultation', 'Skin rash on arms'),
('A005', (SELECT id FROM patients WHERE patient_id = 'P005'), (SELECT id FROM doctors WHERE doctor_id = 'D005'), CURRENT_DATE + INTERVAL '2 days', '09:30', 'confirmed', 'consultation', 'Severe headaches');

-- Insert sample billing records
INSERT INTO public.billing (bill_id, patient_id, appointment_id, bill_date, due_date, total_amount, paid_amount, status, payment_method) VALUES
('B001', (SELECT id FROM patients WHERE patient_id = 'P001'), (SELECT id FROM appointments WHERE appointment_id = 'A001'), CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 2500.00, 0.00, 'pending', NULL),
('B002', (SELECT id FROM patients WHERE patient_id = 'P002'), (SELECT id FROM appointments WHERE appointment_id = 'A002'), CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 1800.00, 1800.00, 'paid', 'credit_card'),
('B003', (SELECT id FROM patients WHERE patient_id = 'P003'), (SELECT id FROM appointments WHERE appointment_id = 'A003'), CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 2200.00, 1000.00, 'partial', 'cash');

-- Insert billing items
INSERT INTO public.billing_items (billing_id, item_name, item_type, quantity, unit_price) VALUES
((SELECT id FROM billing WHERE bill_id = 'B001'), 'Cardiology Consultation', 'consultation', 1, 1500.00),
((SELECT id FROM billing WHERE bill_id = 'B001'), 'ECG Test', 'test', 1, 800.00),
((SELECT id FROM billing WHERE bill_id = 'B001'), 'Chest X-Ray', 'test', 1, 200.00),
((SELECT id FROM billing WHERE bill_id = 'B002'), 'Pediatric Consultation', 'consultation', 1, 1200.00),
((SELECT id FROM billing WHERE bill_id = 'B002'), 'Blood Sugar Test', 'test', 1, 300.00),
((SELECT id FROM billing WHERE bill_id = 'B002'), 'HbA1c Test', 'test', 1, 300.00),
((SELECT id FROM billing WHERE bill_id = 'B003'), 'Orthopedic Consultation', 'consultation', 1, 1800.00),
((SELECT id FROM billing WHERE bill_id = 'B003'), 'Knee X-Ray', 'test', 1, 400.00);

-- Insert sample inventory transactions
INSERT INTO public.inventory_transactions (inventory_id, transaction_type, quantity, reference_type, notes) VALUES
((SELECT id FROM inventory WHERE item_id = 'I001'), 'out', 10, 'usage', 'Dispensed to patients'),
((SELECT id FROM inventory WHERE item_id = 'I002'), 'out', 5, 'usage', 'Prescribed for infections'),
((SELECT id FROM inventory WHERE item_id = 'I004'), 'out', 3, 'usage', 'Used in procedures'),
((SELECT id FROM inventory WHERE item_id = 'I007'), 'out', 8, 'usage', 'Used for wound dressing'),
((SELECT id FROM inventory WHERE item_id = 'I009'), 'out', 2, 'usage', 'Emergency oxygen therapy');
