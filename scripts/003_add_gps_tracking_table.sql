-- Create GPS tracking history table
CREATE TABLE IF NOT EXISTS public.gps_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambulance_id UUID REFERENCES public.ambulances(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2), -- Direction in degrees (0-360)
  speed DECIMAL(6, 2), -- Speed in m/s
  accuracy DECIMAL(8, 2), -- GPS accuracy in meters
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for GPS tracking (authorized users can view)
CREATE POLICY "gps_tracking_select_authorized" ON public.gps_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('dispatcher', 'hospital_staff', 'ambulance_driver')
    )
  );

CREATE POLICY "gps_tracking_insert_ambulance" ON public.gps_tracking FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('ambulance_driver', 'dispatcher')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gps_tracking_ambulance ON public.gps_tracking(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_recorded_at ON public.gps_tracking(recorded_at);

-- Add function to clean up old GPS tracking data (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_gps_tracking()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.gps_tracking 
  WHERE recorded_at < NOW() - INTERVAL '7 days';
END;
$$;
