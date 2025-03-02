
-- Create tables for the CerviAI application

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  phoneNumber TEXT NOT NULL,
  dateOfBirth TIMESTAMP,
  education TEXT,
  occupation TEXT,
  maritalStatus TEXT,
  smokingStatus TEXT,
  alcoholUse TEXT,
  physicalActivity TEXT,
  existingConditions TEXT[],
  commonSymptoms TEXT[],
  reproductiveHistory TEXT,
  lastVisaExamResults TEXT,
  screeningStep TEXT DEFAULT 'before-acetic',
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Screening results table
CREATE TABLE IF NOT EXISTS screening_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysisResult TEXT NOT NULL CHECK (analysisResult IN ('positive', 'negative')),
  analysisDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  beforeAceticImage TEXT,
  afterAceticImage TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup Row Level Security (RLS) policies
-- Patients RLS: Doctors can only see their own patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY patients_select_policy ON patients
  FOR SELECT USING (auth.uid() = doctor_id);
  
CREATE POLICY patients_insert_policy ON patients
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);
  
CREATE POLICY patients_update_policy ON patients
  FOR UPDATE USING (auth.uid() = doctor_id);
  
CREATE POLICY patients_delete_policy ON patients
  FOR DELETE USING (auth.uid() = doctor_id);

-- Screening results RLS: Doctors can only see results for their own patients
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY results_select_policy ON screening_results
  FOR SELECT USING (auth.uid() = doctor_id);
  
CREATE POLICY results_insert_policy ON screening_results
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);
  
CREATE POLICY results_update_policy ON screening_results
  FOR UPDATE USING (auth.uid() = doctor_id);
  
CREATE POLICY results_delete_policy ON screening_results
  FOR DELETE USING (auth.uid() = doctor_id);

-- Create storage bucket for cervical images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cervical_images', 'cervical_images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage
CREATE POLICY storage_select_policy ON storage.objects
  FOR SELECT USING (bucket_id = 'cervical_images');
  
CREATE POLICY storage_insert_policy ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cervical_images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
  
CREATE POLICY storage_update_policy ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'cervical_images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
  
CREATE POLICY storage_delete_policy ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cervical_images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
