-- ============================================================
-- AROGYAPATH - FULL DATABASE SETUP SCRIPT
-- Run this entire file in Supabase SQL Editor
-- ============================================================


-- ============================================================
-- STEP 1: AMBULANCE SYSTEM TABLES
-- ============================================================

-- Create ambulances table
CREATE TABLE IF NOT EXISTS public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number VARCHAR(20) UNIQUE NOT NULL,
  driver_name VARCHAR(100) NOT NULL,
  driver_phone VARCHAR(15) NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'dispatched', 'en_route', 'at_hospital', 'returning', 'maintenance')),
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  hospital_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(15) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  capacity INTEGER DEFAULT 50,
  current_patients INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_requests table
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name VARCHAR(100) NOT NULL,
  patient_phone VARCHAR(15) NOT NULL,
  emergency_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  pickup_address TEXT NOT NULL,
  destination_hospital_id UUID REFERENCES public.hospitals(id),
  ambulance_id UUID REFERENCES public.ambulances(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'en_route', 'picked_up', 'at_hospital', 'completed', 'cancelled')),
  dispatcher_notes TEXT,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_arrival_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_vitals table
CREATE TABLE IF NOT EXISTS public.patient_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  oxygen_saturation INTEGER,
  temperature DECIMAL(4, 2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for communication
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('dispatcher', 'hospital', 'family', 'ambulance')),
  sender_name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles for role-based access
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id VARCHAR(20) UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'receptionist',
  name VARCHAR(100),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  department VARCHAR(100),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  hospital_id UUID REFERENCES public.hospitals(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patch existing user_profiles table with any missing columns
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS hospital_id UUID;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();


-- ============================================================
-- STEP 2: HEALTHCARE MANAGEMENT TABLES
-- ============================================================

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  blood_group VARCHAR(5),
  allergies TEXT,
  medical_history TEXT,
  insurance_provider VARCHAR(200),
  insurance_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  department VARCHAR(100),
  consultation_fee DECIMAL(10,2),
  available_days TEXT[],
  available_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id VARCHAR(20) UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
  appointment_type VARCHAR(50) DEFAULT 'consultation',
  notes TEXT,
  symptoms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id VARCHAR(20) UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  prescription TEXT,
  lab_results TEXT,
  vital_signs JSONB,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing table
CREATE TABLE IF NOT EXISTS public.billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id VARCHAR(20) UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  balance_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  payment_method VARCHAR(50),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_items table
CREATE TABLE IF NOT EXISTS public.billing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_id UUID NOT NULL REFERENCES public.billing(id) ON DELETE CASCADE,
  item_name VARCHAR(200) NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id VARCHAR(20) UNIQUE NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 10,
  maximum_stock INTEGER NOT NULL DEFAULT 1000,
  unit_price DECIMAL(10,2),
  supplier VARCHAR(200),
  expiry_date DATE,
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- STEP 3: GPS TRACKING TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gps_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambulance_id UUID REFERENCES public.ambulances(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),
  speed DECIMAL(6, 2),
  accuracy DECIMAL(8, 2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- STEP 4: NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  recipient_id UUID REFERENCES auth.users(id),
  recipient_role VARCHAR(20),
  emergency_request_id UUID REFERENCES public.emergency_requests(id),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- STEP 5: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_patient ON public.billing(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON public.billing(status);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON public.inventory(current_stock);
CREATE INDEX IF NOT EXISTS idx_ambulances_status ON public.ambulances(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_ambulance ON public.emergency_requests(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_messages_emergency_request ON public.messages(emergency_request_id);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_emergency_request ON public.patient_vitals(emergency_request_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_ambulance ON public.gps_tracking(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_recorded_at ON public.gps_tracking(recorded_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_role ON public.notifications(recipient_role);
CREATE INDEX IF NOT EXISTS idx_notifications_emergency_request ON public.notifications(emergency_request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);


-- ============================================================
-- STEP 6: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 7: RLS POLICIES
-- ============================================================

-- user_profiles
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- hospitals
DROP POLICY IF EXISTS "hospitals_select_all" ON public.hospitals;
CREATE POLICY "hospitals_select_all" ON public.hospitals FOR SELECT USING (auth.uid() IS NOT NULL);

-- ambulances
DROP POLICY IF EXISTS "ambulances_select_authorized" ON public.ambulances;
DROP POLICY IF EXISTS "ambulances_update_dispatcher" ON public.ambulances;
CREATE POLICY "ambulances_select_authorized" ON public.ambulances FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('dispatcher', 'hospital_staff')));
CREATE POLICY "ambulances_update_dispatcher" ON public.ambulances FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'dispatcher'));

-- emergency_requests
DROP POLICY IF EXISTS "emergency_requests_select_authorized" ON public.emergency_requests;
DROP POLICY IF EXISTS "emergency_requests_insert_dispatcher" ON public.emergency_requests;
DROP POLICY IF EXISTS "emergency_requests_update_authorized" ON public.emergency_requests;
CREATE POLICY "emergency_requests_select_authorized" ON public.emergency_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'family_member')));
CREATE POLICY "emergency_requests_insert_dispatcher" ON public.emergency_requests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'dispatcher'));
CREATE POLICY "emergency_requests_update_authorized" ON public.emergency_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('dispatcher', 'hospital_staff')));

-- patient_vitals
DROP POLICY IF EXISTS "patient_vitals_select_authorized" ON public.patient_vitals;
DROP POLICY IF EXISTS "patient_vitals_insert_ambulance" ON public.patient_vitals;
CREATE POLICY "patient_vitals_select_authorized" ON public.patient_vitals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'ambulance_driver')));
CREATE POLICY "patient_vitals_insert_ambulance" ON public.patient_vitals FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('ambulance_driver', 'hospital_staff')));

-- messages
DROP POLICY IF EXISTS "messages_select_related" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_authorized" ON public.messages;
CREATE POLICY "messages_select_related" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'family_member', 'ambulance_driver')));
CREATE POLICY "messages_insert_authorized" ON public.messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'family_member', 'ambulance_driver')));

-- patients
DROP POLICY IF EXISTS "Healthcare staff can view patients" ON public.patients;
DROP POLICY IF EXISTS "Healthcare staff can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Healthcare staff can update patients" ON public.patients;
CREATE POLICY "Healthcare staff can view patients" ON public.patients FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));
CREATE POLICY "Healthcare staff can insert patients" ON public.patients FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));
CREATE POLICY "Healthcare staff can update patients" ON public.patients FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));

-- doctors, appointments, medical_records, billing, billing_items, inventory, inventory_transactions
DROP POLICY IF EXISTS "Healthcare staff can manage doctors" ON public.doctors;
DROP POLICY IF EXISTS "Healthcare staff can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Healthcare staff can manage medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Healthcare staff can manage billing" ON public.billing;
DROP POLICY IF EXISTS "Healthcare staff can manage billing items" ON public.billing_items;
DROP POLICY IF EXISTS "Healthcare staff can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Healthcare staff can manage inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Healthcare staff can manage doctors" ON public.doctors FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));
CREATE POLICY "Healthcare staff can manage appointments" ON public.appointments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));
CREATE POLICY "Healthcare staff can manage medical records" ON public.medical_records FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));
CREATE POLICY "Healthcare staff can manage billing" ON public.billing FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));
CREATE POLICY "Healthcare staff can manage billing items" ON public.billing_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));
CREATE POLICY "Healthcare staff can manage inventory" ON public.inventory FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));
CREATE POLICY "Healthcare staff can manage inventory transactions" ON public.inventory_transactions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()));

-- gps_tracking
DROP POLICY IF EXISTS "gps_tracking_select_authorized" ON public.gps_tracking;
DROP POLICY IF EXISTS "gps_tracking_insert_ambulance" ON public.gps_tracking;
CREATE POLICY "gps_tracking_select_authorized" ON public.gps_tracking FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'ambulance_driver')));
CREATE POLICY "gps_tracking_insert_ambulance" ON public.gps_tracking FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('ambulance_driver', 'dispatcher')));

-- notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_authorized" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT
  USING (recipient_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = notifications.recipient_role));
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
  USING (recipient_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = notifications.recipient_role));
CREATE POLICY "notifications_insert_authorized" ON public.notifications FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('dispatcher', 'hospital_staff')));


-- ============================================================
-- STEP 8: FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mapped_role VARCHAR;
BEGIN
  CASE COALESCE(NEW.raw_user_meta_data ->> 'role', 'family')
    WHEN 'dispatcher' THEN mapped_role := 'dispatcher';
    WHEN 'hospital' THEN mapped_role := 'hospital_staff';
    WHEN 'family' THEN mapped_role := 'family_member';
    WHEN 'ambulance' THEN mapped_role := 'ambulance_driver';
    ELSE mapped_role := 'receptionist';
  END CASE;

  INSERT INTO public.user_profiles (
    id,
    employee_id,
    name,
    first_name,
    last_name,
    role,
    email
  )
  VALUES (
    NEW.id,
    'E' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 6, '0'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name',
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'Unknown') || ' ' ||
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User')),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User'),
    mapped_role,
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- GPS cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_gps_tracking()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.gps_tracking WHERE recorded_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Emergency notification trigger function
CREATE OR REPLACE FUNCTION public.create_emergency_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'assigned' THEN
        INSERT INTO public.notifications (title, message, type, recipient_role, emergency_request_id, priority)
        VALUES ('Ambulance Assigned', 'Ambulance has been assigned to emergency for ' || NEW.patient_name, 'ambulance_dispatch', 'hospital_staff', NEW.id, CASE WHEN NEW.severity = 'critical' THEN 'high' ELSE 'medium' END);
      WHEN 'en_route' THEN
        INSERT INTO public.notifications (title, message, type, recipient_role, emergency_request_id, priority)
        VALUES ('Ambulance En Route', 'Ambulance is en route to pickup ' || NEW.patient_name, 'patient_update', 'hospital_staff', NEW.id, 'medium');
      WHEN 'picked_up' THEN
        INSERT INTO public.notifications (title, message, type, recipient_role, emergency_request_id, priority)
        VALUES ('Patient Picked Up', 'Patient ' || NEW.patient_name || ' has been picked up and is en route to hospital', 'patient_update', 'hospital_staff', NEW.id, 'medium');
      WHEN 'at_hospital' THEN
        INSERT INTO public.notifications (title, message, type, recipient_role, emergency_request_id, priority)
        VALUES ('Patient Arriving', 'Patient ' || NEW.patient_name || ' is arriving at the hospital', 'arrival_alert', 'hospital_staff', NEW.id, 'high');
      ELSE
        -- Do nothing
    END CASE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS emergency_request_notification_trigger ON public.emergency_requests;
CREATE TRIGGER emergency_request_notification_trigger
  AFTER UPDATE ON public.emergency_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_emergency_notification();


-- ============================================================
-- STEP 9: SEED DATA - HOSPITALS & AMBULANCES
-- ============================================================

INSERT INTO public.hospitals (id, name, address, phone, lat, lng, capacity, current_patients) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'City General Hospital', '123 Main St, Downtown', '+1-555-0101', 40.7128, -74.0060, 100, 45),
  ('550e8400-e29b-41d4-a716-446655440002', 'Metro Medical Center', '456 Oak Ave, Midtown', '+1-555-0102', 40.7589, -73.9851, 80, 32),
  ('550e8400-e29b-41d4-a716-446655440003', 'Riverside Emergency Hospital', '789 River Rd, Eastside', '+1-555-0103', 40.7282, -73.9942, 60, 28),
  ('550e8400-e29b-41d4-a716-446655440004', 'Northside Medical', '321 North St, Uptown', '+1-555-0104', 40.7831, -73.9712, 90, 41)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ambulances (id, vehicle_number, driver_name, driver_phone, status, current_lat, current_lng, hospital_id) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'AMB-001', 'John Smith', '+1-555-1001', 'available', 40.7128, -74.0060, '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440002', 'AMB-002', 'Sarah Johnson', '+1-555-1002', 'dispatched', 40.7589, -73.9851, '550e8400-e29b-41d4-a716-446655440002'),
  ('660e8400-e29b-41d4-a716-446655440003', 'AMB-003', 'Mike Davis', '+1-555-1003', 'en_route', 40.7282, -73.9942, '550e8400-e29b-41d4-a716-446655440003'),
  ('660e8400-e29b-41d4-a716-446655440004', 'AMB-004', 'Lisa Wilson', '+1-555-1004', 'at_hospital', 40.7831, -73.9712, '550e8400-e29b-41d4-a716-446655440004'),
  ('660e8400-e29b-41d4-a716-446655440005', 'AMB-005', 'David Brown', '+1-555-1005', 'available', 40.7505, -73.9934, '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440006', 'AMB-006', 'Emily Chen', '+1-555-1006', 'maintenance', 40.7614, -73.9776, '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.emergency_requests (id, patient_name, patient_phone, emergency_type, severity, pickup_lat, pickup_lng, pickup_address, destination_hospital_id, ambulance_id, status, dispatcher_notes, estimated_arrival) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Robert Martinez', '+1-555-2001', 'Heart Attack', 'critical', 40.7505, -73.9934, '100 Broadway, Manhattan', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'en_route', 'Patient conscious, chest pain', NOW() + INTERVAL '8 minutes'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Jennifer Lee', '+1-555-2002', 'Car Accident', 'high', 40.7614, -73.9776, '200 5th Ave, Manhattan', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'picked_up', 'Multiple injuries, stable vitals', NOW() + INTERVAL '12 minutes'),
  ('770e8400-e29b-41d4-a716-446655440003', 'Michael Thompson', '+1-555-2003', 'Stroke', 'critical', 40.7282, -73.9942, '300 Park Ave, Manhattan', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', 'at_hospital', 'Speech impairment, left side weakness', NOW() + INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patient_vitals (emergency_request_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, temperature) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 110, 140, 90, 95, 98.6),
  ('770e8400-e29b-41d4-a716-446655440002', 85, 120, 80, 98, 99.1),
  ('770e8400-e29b-41d4-a716-446655440003', 95, 160, 95, 92, 98.2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.messages (emergency_request_id, sender_type, sender_name, message) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'dispatcher', 'Control Center', 'AMB-002 dispatched to your location. ETA 8 minutes.'),
  ('770e8400-e29b-41d4-a716-446655440001', 'ambulance', 'Sarah Johnson', 'En route to pickup location. Patient prep team standby.'),
  ('770e8400-e29b-41d4-a716-446655440002', 'hospital', 'Metro Medical', 'Trauma team ready. Bay 3 prepared for incoming patient.'),
  ('770e8400-e29b-41d4-a716-446655440003', 'family', 'Susan Thompson', 'Is my husband okay? When will he arrive at the hospital?');


-- ============================================================
-- STEP 10: SEED DATA - HEALTHCARE
-- ============================================================

INSERT INTO public.doctors (doctor_id, first_name, last_name, specialization, license_number, phone, email, department, consultation_fee, available_days, available_hours) VALUES
('D001', 'Dr. Rajesh', 'Kumar', 'Cardiology', 'LIC001', '+91-9876543210', 'rajesh.kumar@hospital.com', 'Cardiology', 1500.00, ARRAY['monday', 'tuesday', 'wednesday', 'friday'], '{"morning": "09:00-12:00", "evening": "16:00-19:00"}'),
('D002', 'Dr. Priya', 'Sharma', 'Pediatrics', 'LIC002', '+91-9876543211', 'priya.sharma@hospital.com', 'Pediatrics', 1200.00, ARRAY['monday', 'wednesday', 'thursday', 'saturday'], '{"morning": "08:00-12:00", "afternoon": "14:00-17:00"}'),
('D003', 'Dr. Amit', 'Singh', 'Orthopedics', 'LIC003', '+91-9876543212', 'amit.singh@hospital.com', 'Orthopedics', 1800.00, ARRAY['tuesday', 'thursday', 'friday', 'saturday'], '{"morning": "10:00-13:00", "evening": "15:00-18:00"}'),
('D004', 'Dr. Sunita', 'Patel', 'Dermatology', 'LIC004', '+91-9876543213', 'sunita.patel@hospital.com', 'Dermatology', 1000.00, ARRAY['monday', 'tuesday', 'thursday', 'friday'], '{"morning": "09:00-12:00", "afternoon": "14:00-17:00"}'),
('D005', 'Dr. Vikram', 'Gupta', 'Neurology', 'LIC005', '+91-9876543214', 'vikram.gupta@hospital.com', 'Neurology', 2000.00, ARRAY['wednesday', 'friday', 'saturday'], '{"morning": "08:00-11:00", "evening": "16:00-19:00"}')
ON CONFLICT (doctor_id) DO NOTHING;

INSERT INTO public.patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, medical_history, insurance_provider, insurance_number) VALUES
('P001', 'Ravi', 'Mehta', '1985-03-15', 'male', '+91-9123456789', 'ravi.mehta@email.com', '123 MG Road, Mumbai, Maharashtra', 'Sunita Mehta', '+91-9123456790', 'O+', 'None', 'Hypertension', 'Star Health Insurance', 'SHI123456'),
('P002', 'Anita', 'Joshi', '1990-07-22', 'female', '+91-9123456791', 'anita.joshi@email.com', '456 Park Street, Delhi', 'Raj Joshi', '+91-9123456792', 'A+', 'Penicillin', 'Diabetes Type 2', 'HDFC ERGO', 'HDFC789012'),
('P003', 'Kiran', 'Reddy', '1978-11-08', 'male', '+91-9123456793', 'kiran.reddy@email.com', '789 Brigade Road, Bangalore, Karnataka', 'Lakshmi Reddy', '+91-9123456794', 'B+', 'Dust allergy', 'Asthma', 'ICICI Lombard', 'ICICI345678'),
('P004', 'Meera', 'Nair', '1995-01-30', 'female', '+91-9123456795', 'meera.nair@email.com', '321 Marine Drive, Kochi, Kerala', 'Suresh Nair', '+91-9123456796', 'AB+', 'Shellfish', 'None', 'Bajaj Allianz', 'BAJAJ901234'),
('P005', 'Arjun', 'Kapoor', '1982-09-12', 'male', '+91-9123456797', 'arjun.kapoor@email.com', '654 CP, New Delhi', 'Kavita Kapoor', '+91-9123456798', 'O-', 'None', 'Migraine', 'Max Bupa', 'MAX567890')
ON CONFLICT (patient_id) DO NOTHING;

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
('I010', 'ECG Machine', 'equipment', 'Portable electrocardiogram device', 3, 1, 5, 125000.00, 'CardioTech Systems', NULL, 'Equipment-B3')
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO public.appointments (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status, appointment_type, symptoms) VALUES
('A001', (SELECT id FROM patients WHERE patient_id = 'P001'), (SELECT id FROM doctors WHERE doctor_id = 'D001'), CURRENT_DATE + INTERVAL '1 day', '10:00', 'scheduled', 'consultation', 'Chest pain and shortness of breath'),
('A002', (SELECT id FROM patients WHERE patient_id = 'P002'), (SELECT id FROM doctors WHERE doctor_id = 'D002'), CURRENT_DATE + INTERVAL '2 days', '14:30', 'confirmed', 'follow-up', 'Routine diabetes check-up'),
('A003', (SELECT id FROM patients WHERE patient_id = 'P003'), (SELECT id FROM doctors WHERE doctor_id = 'D003'), CURRENT_DATE + INTERVAL '1 day', '16:00', 'scheduled', 'consultation', 'Knee pain after exercise'),
('A004', (SELECT id FROM patients WHERE patient_id = 'P004'), (SELECT id FROM doctors WHERE doctor_id = 'D004'), CURRENT_DATE + INTERVAL '3 days', '11:00', 'scheduled', 'consultation', 'Skin rash on arms'),
('A005', (SELECT id FROM patients WHERE patient_id = 'P005'), (SELECT id FROM doctors WHERE doctor_id = 'D005'), CURRENT_DATE + INTERVAL '2 days', '09:30', 'confirmed', 'consultation', 'Severe headaches')
ON CONFLICT (appointment_id) DO NOTHING;

INSERT INTO public.billing (bill_id, patient_id, appointment_id, bill_date, due_date, total_amount, paid_amount, status, payment_method) VALUES
('B001', (SELECT id FROM patients WHERE patient_id = 'P001'), (SELECT id FROM appointments WHERE appointment_id = 'A001'), CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 2500.00, 0.00, 'pending', NULL),
('B002', (SELECT id FROM patients WHERE patient_id = 'P002'), (SELECT id FROM appointments WHERE appointment_id = 'A002'), CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 1800.00, 1800.00, 'paid', 'credit_card'),
('B003', (SELECT id FROM patients WHERE patient_id = 'P003'), (SELECT id FROM appointments WHERE appointment_id = 'A003'), CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 2200.00, 1000.00, 'partial', 'cash')
ON CONFLICT (bill_id) DO NOTHING;

INSERT INTO public.billing_items (billing_id, item_name, item_type, quantity, unit_price) VALUES
((SELECT id FROM billing WHERE bill_id = 'B001'), 'Cardiology Consultation', 'consultation', 1, 1500.00),
((SELECT id FROM billing WHERE bill_id = 'B001'), 'ECG Test', 'test', 1, 800.00),
((SELECT id FROM billing WHERE bill_id = 'B001'), 'Chest X-Ray', 'test', 1, 200.00),
((SELECT id FROM billing WHERE bill_id = 'B002'), 'Pediatric Consultation', 'consultation', 1, 1200.00),
((SELECT id FROM billing WHERE bill_id = 'B002'), 'Blood Sugar Test', 'test', 1, 300.00),
((SELECT id FROM billing WHERE bill_id = 'B002'), 'HbA1c Test', 'test', 1, 300.00),
((SELECT id FROM billing WHERE bill_id = 'B003'), 'Orthopedic Consultation', 'consultation', 1, 1800.00),
((SELECT id FROM billing WHERE bill_id = 'B003'), 'Knee X-Ray', 'test', 1, 400.00);

INSERT INTO public.inventory_transactions (inventory_id, transaction_type, quantity, reference_type, notes) VALUES
((SELECT id FROM inventory WHERE item_id = 'I001'), 'out', 10, 'usage', 'Dispensed to patients'),
((SELECT id FROM inventory WHERE item_id = 'I002'), 'out', 5, 'usage', 'Prescribed for infections'),
((SELECT id FROM inventory WHERE item_id = 'I004'), 'out', 3, 'usage', 'Used in procedures'),
((SELECT id FROM inventory WHERE item_id = 'I007'), 'out', 8, 'usage', 'Used for wound dressing'),
((SELECT id FROM inventory WHERE item_id = 'I009'), 'out', 2, 'usage', 'Emergency oxygen therapy');

-- ============================================================
-- SETUP COMPLETE!
-- ============================================================
