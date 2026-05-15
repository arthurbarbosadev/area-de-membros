export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      allowed_emails: {
        Row: {
          added_at: string;
          added_by: string | null;
          email: string;
        };
        Insert: {
          added_at?: string;
          added_by?: string | null;
          email: string;
        };
        Update: {
          added_at?: string;
          added_by?: string | null;
          email?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          module: string | null;
          position: number;
          thumbnail_url: string | null;
          title: string;
          video_url: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          module?: string | null;
          position?: number;
          thumbnail_url?: string | null;
          title: string;
          video_url?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          module?: string | null;
          position?: number;
          thumbnail_url?: string | null;
          title?: string;
          video_url?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          is_admin: boolean;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          is_admin?: boolean;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      signup_requests: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["signup_status"];
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["signup_status"];
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["signup_status"];
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      signup_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
