
-- Schema for CerviScan application
-- Run this in your Supabase SQL Editor to set up all needed tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Doctors table - extends the auth.users table with additional information
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  specialty TEXT,
  license_number TEXT,
  hospital_affiliation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on doctors table
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Policies for doctors table
CREATE POLICY "Doctors can view their own profile" 
  ON public.doctors
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Doctors can update their own profile" 
  ON public.doctors
  FOR UPDATE 
  USING (auth.uid() = id);

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  contact_number TEXT,
  email TEXT,
  medical_history TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on patients table
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Policies for patients table
CREATE POLICY "Doctors can view their patients" 
  ON public.patients
  FOR SELECT 
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert their patients" 
  ON public.patients
  FOR INSERT 
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their patients" 
  ON public.patients
  FOR UPDATE 
  USING (auth.uid() = doctor_id);

-- Screening results table
CREATE TABLE IF NOT EXISTS public.screening_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  before_image_url TEXT,
  after_image_url TEXT,
  image_url TEXT,
  result TEXT NOT NULL,
  confidence NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on screening_results table
ALTER TABLE public.screening_results ENABLE ROW LEVEL SECURITY;

-- Policies for screening_results table
CREATE POLICY "Doctors can view their patients' results" 
  ON public.screening_results
  FOR SELECT 
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert their patients' results" 
  ON public.screening_results
  FOR INSERT 
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their patients' results" 
  ON public.screening_results
  FOR UPDATE 
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their patients' results" 
  ON public.screening_results
  FOR DELETE 
  USING (auth.uid() = doctor_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.doctors (id, name, email)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'name', 'Dr. ' || split_part(new.email, '@', 1)), new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create doctor profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for cervical images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cervical_images', 'cervical_images', false)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload to storage
CREATE POLICY "Authenticated users can upload cervical images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cervical_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to access their own uploads
CREATE POLICY "Users can view their own cervical images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'cervical_images' AND auth.uid()::text = (storage.foldername(name))[1]);
