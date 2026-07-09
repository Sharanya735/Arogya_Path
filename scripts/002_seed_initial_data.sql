-- Insert sample hospitals
INSERT INTO public.hospitals (id, name, address, phone, lat, lng, capacity, current_patients) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'City General Hospital', '123 Main St, Downtown', '+1-555-0101', 40.7128, -74.0060, 100, 45),
  ('550e8400-e29b-41d4-a716-446655440002', 'Metro Medical Center', '456 Oak Ave, Midtown', '+1-555-0102', 40.7589, -73.9851, 80, 32),
  ('550e8400-e29b-41d4-a716-446655440003', 'Riverside Emergency Hospital', '789 River Rd, Eastside', '+1-555-0103', 40.7282, -73.9942, 60, 28),
  ('550e8400-e29b-41d4-a716-446655440004', 'Northside Medical', '321 North St, Uptown', '+1-555-0104', 40.7831, -73.9712, 90, 41)
ON CONFLICT (id) DO NOTHING;

-- Insert sample ambulances
INSERT INTO public.ambulances (id, vehicle_number, driver_name, driver_phone, status, current_lat, current_lng, hospital_id) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'AMB-001', 'John Smith', '+1-555-1001', 'available', 40.7128, -74.0060, '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440002', 'AMB-002', 'Sarah Johnson', '+1-555-1002', 'dispatched', 40.7589, -73.9851, '550e8400-e29b-41d4-a716-446655440002'),
  ('660e8400-e29b-41d4-a716-446655440003', 'AMB-003', 'Mike Davis', '+1-555-1003', 'en_route', 40.7282, -73.9942, '550e8400-e29b-41d4-a716-446655440003'),
  ('660e8400-e29b-41d4-a716-446655440004', 'AMB-004', 'Lisa Wilson', '+1-555-1004', 'at_hospital', 40.7831, -73.9712, '550e8400-e29b-41d4-a716-446655440004'),
  ('660e8400-e29b-41d4-a716-446655440005', 'AMB-005', 'David Brown', '+1-555-1005', 'available', 40.7505, -73.9934, '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440006', 'AMB-006', 'Emily Chen', '+1-555-1006', 'maintenance', 40.7614, -73.9776, '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Insert sample emergency requests
INSERT INTO public.emergency_requests (id, patient_name, patient_phone, emergency_type, severity, pickup_lat, pickup_lng, pickup_address, destination_hospital_id, ambulance_id, status, dispatcher_notes, estimated_arrival) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Robert Martinez', '+1-555-2001', 'Heart Attack', 'critical', 40.7505, -73.9934, '100 Broadway, Manhattan', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'en_route', 'Patient conscious, chest pain', NOW() + INTERVAL '8 minutes'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Jennifer Lee', '+1-555-2002', 'Car Accident', 'high', 40.7614, -73.9776, '200 5th Ave, Manhattan', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'picked_up', 'Multiple injuries, stable vitals', NOW() + INTERVAL '12 minutes'),
  ('770e8400-e29b-41d4-a716-446655440003', 'Michael Thompson', '+1-555-2003', 'Stroke', 'critical', 40.7282, -73.9942, '300 Park Ave, Manhattan', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', 'at_hospital', 'Speech impairment, left side weakness', NOW() + INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

-- Insert sample patient vitals
INSERT INTO public.patient_vitals (emergency_request_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, temperature) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 110, 140, 90, 95, 98.6),
  ('770e8400-e29b-41d4-a716-446655440002', 85, 120, 80, 98, 99.1),
  ('770e8400-e29b-41d4-a716-446655440003', 95, 160, 95, 92, 98.2)
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages
INSERT INTO public.messages (emergency_request_id, sender_type, sender_name, message) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'dispatcher', 'Control Center', 'AMB-002 dispatched to your location. ETA 8 minutes.'),
  ('770e8400-e29b-41d4-a716-446655440001', 'ambulance', 'Sarah Johnson', 'En route to pickup location. Patient prep team standby.'),
  ('770e8400-e29b-41d4-a716-446655440002', 'hospital', 'Metro Medical', 'Trauma team ready. Bay 3 prepared for incoming patient.'),
  ('770e8400-e29b-41d4-a716-446655440003', 'family', 'Susan Thompson', 'Is my husband okay? When will he arrive at the hospital?')
ON CONFLICT (id) DO NOTHING;
