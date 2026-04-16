import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtubwpkemzvpsfbpryde.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dWJ3cGtlbXp2cHNmYnByeWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzU0NTUsImV4cCI6MjA5MTkxMTQ1NX0.HTsov3uO2T46RWqZyzSdUcdzECy2Y0-1czt0ddONEpQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      loan_applications: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          
          // Loan Selection
          loan_type: string;
          loan_amount: number;
          
          // Purpose
          purpose: string;
          purpose_description: string | null;
          
          // Personal Details
          full_name: string;
          date_of_birth: string;
          gender: string;
          employment_status: string;
          education_level: string;
          has_outstanding_loan: string;
          referral_source: string;
          
          // Financial Details
          monthly_income: number;
          income_source: string;
          has_other_income: string;
          income_type: string;
          
          // Device Details
          phone_usage_duration: string;
          owns_phone: string;
          phone_condition: string;
          
          // Identification
          mobile_number: string;
          national_id: string;
          
          // File uploads
          id_front_url: string | null;
          id_back_url: string | null;
          kra_pin_url: string | null;
          id_front_path: string | null;
          id_back_path: string | null;
          kra_pin_path: string | null;
          
          // Status
          status: 'pending' | 'approved' | 'rejected' | 'under_review';
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          loan_type: string;
          loan_amount: number;
          purpose: string;
          purpose_description?: string | null;
          full_name: string;
          date_of_birth: string;
          gender: string;
          employment_status: string;
          education_level: string;
          has_outstanding_loan: string;
          referral_source: string;
          monthly_income: number;
          income_source: string;
          has_other_income: string;
          income_type: string;
          phone_usage_duration: string;
          owns_phone: string;
          phone_condition: string;
          mobile_number: string;
          national_id: string;
          id_front_url?: string | null;
          id_back_url?: string | null;
          kra_pin_url?: string | null;
          id_front_path?: string | null;
          id_back_path?: string | null;
          kra_pin_path?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'under_review';
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          loan_type?: string;
          loan_amount?: number;
          purpose?: string;
          purpose_description?: string | null;
          full_name?: string;
          date_of_birth?: string;
          gender?: string;
          employment_status?: string;
          education_level?: string;
          has_outstanding_loan?: string;
          referral_source?: string;
          monthly_income?: number;
          income_source?: string;
          has_other_income?: string;
          income_type?: string;
          phone_usage_duration?: string;
          owns_phone?: string;
          phone_condition?: string;
          mobile_number?: string;
          national_id?: string;
          id_front_url?: string | null;
          id_back_url?: string | null;
          kra_pin_url?: string | null;
          id_front_path?: string | null;
          id_back_path?: string | null;
          kra_pin_path?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'under_review';
        };
      };
    };
  };
};
