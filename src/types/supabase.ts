export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin'
          first_name: string
          last_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin'
          first_name: string
          last_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin'
          first_name?: string
          last_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      individuals: {
        Row: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: 'male' | 'female'
          phone: string | null
          district: string
          family_id: string | null
          address: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: 'male' | 'female'
          phone?: string | null
          district: string
          family_id?: string | null
          address?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: 'male' | 'female'
          phone?: string | null
          district?: string
          family_id?: string | null
          address?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      families: {
        Row: {
          id: string
          name: string
          status: 'green' | 'yellow' | 'red'
          district: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status: 'green' | 'yellow' | 'red'
          district?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'green' | 'yellow' | 'red'
          district?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      needs: {
        Row: {
          id: string
          individual_id: string
          category: 'medical' | 'financial' | 'food' | 'shelter' | 'clothing' | 'education' | 'employment' | 'transportation' | 'other'
          description: string
          status: 'pending' | 'in_progress' | 'completed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          individual_id: string
          category: 'medical' | 'financial' | 'food' | 'shelter' | 'clothing' | 'education' | 'employment' | 'transportation' | 'other'
          description: string
          status: 'pending' | 'in_progress' | 'completed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          individual_id?: string
          category?: 'medical' | 'financial' | 'food' | 'shelter' | 'clothing' | 'education' | 'employment' | 'transportation' | 'other'
          description?: string
          status?: 'pending' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          individual_id: string
          role: 'parent' | 'child'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          individual_id: string
          role: 'parent' | 'child'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          individual_id?: string
          role?: 'parent' | 'child'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
