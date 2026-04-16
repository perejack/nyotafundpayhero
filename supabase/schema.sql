-- NYOTA Fund Loan Applications Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Create the loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Loan Selection
    loan_type TEXT NOT NULL,
    loan_amount INTEGER NOT NULL,
    
    -- Purpose
    purpose TEXT NOT NULL,
    purpose_description TEXT,
    
    -- Personal Details
    full_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL,
    employment_status TEXT NOT NULL,
    education_level TEXT NOT NULL,
    has_outstanding_loan TEXT NOT NULL,
    referral_source TEXT NOT NULL,
    
    -- Financial Details
    monthly_income INTEGER NOT NULL,
    income_source TEXT NOT NULL,
    has_other_income TEXT NOT NULL,
    income_type TEXT NOT NULL,
    
    -- Device Details
    phone_usage_duration TEXT NOT NULL,
    owns_phone TEXT NOT NULL,
    phone_condition TEXT NOT NULL,
    
    -- Identification
    mobile_number TEXT NOT NULL,
    national_id TEXT NOT NULL,
    
    -- File uploads
    id_front_url TEXT,
    id_back_url TEXT,
    kra_pin_url TEXT,
    id_front_path TEXT,
    id_back_path TEXT,
    kra_pin_path TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loan_applications_national_id ON loan_applications(national_id);

-- Set up Row Level Security (RLS)
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for application submissions)
CREATE POLICY "Allow public submissions" ON loan_applications
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to read (for admin dashboard)
CREATE POLICY "Allow admin read access" ON loan_applications
    FOR SELECT TO authenticated
    USING (true);

-- Policy: Allow authenticated users to update status
CREATE POLICY "Allow admin update access" ON loan_applications
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_loan_applications_updated_at
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
