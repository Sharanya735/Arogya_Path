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
  role VARCHAR(20) NOT NULL CHECK (role IN ('dispatcher', 'hospital_staff', 'family_member', 'ambulance_driver')),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  hospital_id UUID REFERENCES public.hospitals(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ambulances (dispatchers and hospital staff can view all)
CREATE POLICY "ambulances_select_authorized" ON public.ambulances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('dispatcher', 'hospital_staff')
    )
  );

CREATE POLICY "ambulances_update_dispatcher" ON public.ambulances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'dispatcher'
    )
  );

-- RLS Policies for hospitals (all authenticated users can view)
CREATE POLICY "hospitals_select_all" ON public.hospitals FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for emergency_requests
CREATE POLICY "emergency_requests_select_authorized" ON public.emergency_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'family_member')
    )
  );

CREATE POLICY "emergency_requests_insert_dispatcher" ON public.emergency_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'dispatcher'
    )
  );

CREATE POLICY "emergency_requests_update_authorized" ON public.emergency_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('dispatcher', 'hospital_staff')
    )
  );

-- RLS Policies for patient_vitals
CREATE POLICY "patient_vitals_select_authorized" ON public.patient_vitals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'ambulance_driver')
    )
  );

CREATE POLICY "patient_vitals_insert_ambulance" ON public.patient_vitals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('ambulance_driver', 'hospital_staff')
    )
  );

-- RLS Policies for messages
CREATE POLICY "messages_select_related" ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'family_member', 'ambulance_driver')
    )
  );

CREATE POLICY "messages_insert_authorized" ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'family_member', 'ambulance_driver')
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ambulances_status ON public.ambulances(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_ambulance ON public.emergency_requests(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_messages_emergency_request ON public.messages(emergency_request_id);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_emergency_request ON public.patient_vitals(emergency_request_id);
