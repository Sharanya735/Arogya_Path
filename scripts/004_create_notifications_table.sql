-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- ambulance_dispatch, patient_update, arrival_alert, critical_alert, etc.
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  recipient_id UUID REFERENCES auth.users(id), -- Specific user recipient (optional)
  recipient_role VARCHAR(20), -- Role-based recipient (dispatcher, hospital_staff, etc.)
  emergency_request_id UUID REFERENCES public.emergency_requests(id),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT
  USING (
    recipient_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = notifications.recipient_role
    )
  );

CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
  USING (
    recipient_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = notifications.recipient_role
    )
  );

CREATE POLICY "notifications_insert_authorized" ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('dispatcher', 'hospital_staff')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_role ON public.notifications(recipient_role);
CREATE INDEX IF NOT EXISTS idx_notifications_emergency_request ON public.notifications(emergency_request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Function to automatically create notifications for emergency events
CREATE OR REPLACE FUNCTION create_emergency_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create notification when emergency request status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'assigned' THEN
        INSERT INTO public.notifications (title, message, type, recipient_role, emergency_request_id, priority)
        VALUES (
          'Ambulance Assigned',
          'Ambulance has been assigned to emergency for ' || NEW.patient_name,
          'ambulance_dispatch',
          'hospital_staff',
          NEW.id,
          CASE WHEN NEW.severity = 'critical' THEN 'high' ELSE 'medium' END
        );
      
      WHEN 'en_route' THEN
        INSERT INTO public.notifications (title, message, type, recipient_role, emergency_request_id, priority)
        VALUES (
          'Ambulance En Route',
          'Ambulance is en route to pickup ' || NEW.patient_name,
          'patient_update',
          'hospital_staff',
          NEW.id,
          'medium'
        );
      
      WHEN 'picked_up' THEN
        INSERT INTO public.notifications (title, message, type, recipient_role, emergency_request_id, priority)
        VALUES (
          'Patient Picked Up',
          'Patient ' || NEW.patient_name || ' has been picked up and is en route to hospital',
          'patient_update',
          'hospital_staff',
          NEW.id,
          'medium'
        );
      
      WHEN 'at_hospital' THEN
        INSERT INTO public.notifications (title, message, type, recipient_role, emergency_request_id, priority)
        VALUES (
          'Patient Arriving',
          'Patient ' || NEW.patient_name || ' is arriving at the hospital',
          'arrival_alert',
          'hospital_staff',
          NEW.id,
          'high'
        );
      
      ELSE
        -- Do nothing for other status changes
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic notifications
DROP TRIGGER IF EXISTS emergency_request_notification_trigger ON public.emergency_requests;
CREATE TRIGGER emergency_request_notification_trigger
  AFTER UPDATE ON public.emergency_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_emergency_notification();
