export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bills: {
        Row: {
          bill_number: string
          created_at: string | null
          customer_id: string
          discount: number | null
          final_amount: number
          id: string
          late_fee: number | null
          month: number
          payment_date: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"] | null
          status: Database["public"]["Enums"]["bill_status"] | null
          total_amount: number
          total_liters: number
          updated_at: string | null
          year: number
        }
        Insert: {
          bill_number: string
          created_at?: string | null
          customer_id: string
          discount?: number | null
          final_amount?: number
          id?: string
          late_fee?: number | null
          month: number
          payment_date?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          status?: Database["public"]["Enums"]["bill_status"] | null
          total_amount?: number
          total_liters?: number
          updated_at?: string | null
          year: number
        }
        Update: {
          bill_number?: string
          created_at?: string | null
          customer_id?: string
          discount?: number | null
          final_amount?: number
          id?: string
          late_fee?: number | null
          month?: number
          payment_date?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          status?: Database["public"]["Enums"]["bill_status"] | null
          total_amount?: number
          total_liters?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          daily_quantity: number
          id: string
          is_active: boolean | null
          milk_type: Database["public"]["Enums"]["milk_type"]
          name: string
          phone: string | null
          rate_per_liter: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          daily_quantity?: number
          id?: string
          is_active?: boolean | null
          milk_type?: Database["public"]["Enums"]["milk_type"]
          name: string
          phone?: string | null
          rate_per_liter?: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          daily_quantity?: number
          id?: string
          is_active?: boolean | null
          milk_type?: Database["public"]["Enums"]["milk_type"]
          name?: string
          phone?: string | null
          rate_per_liter?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          receipt_url: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      milk_entries: {
        Row: {
          created_at: string | null
          customer_id: string
          date: string
          delivered: boolean | null
          extra_quantity: number | null
          id: string
          rate_per_liter: number
          regular_quantity: number
          session: Database["public"]["Enums"]["session_type"]
          total_amount: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          date?: string
          delivered?: boolean | null
          extra_quantity?: number | null
          id?: string
          rate_per_liter: number
          regular_quantity?: number
          session: Database["public"]["Enums"]["session_type"]
          total_amount?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          date?: string
          delivered?: boolean | null
          extra_quantity?: number | null
          id?: string
          rate_per_liter?: number
          regular_quantity?: number
          session?: Database["public"]["Enums"]["session_type"]
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "milk_entries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bill_id: string
          created_at: string | null
          customer_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      bill_status: "paid" | "unpaid"
      milk_type: "cow" | "buffalo"
      payment_mode: "cash" | "online" | "upi"
      session_type: "morning" | "evening"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      bill_status: ["paid", "unpaid"],
      milk_type: ["cow", "buffalo"],
      payment_mode: ["cash", "online", "upi"],
      session_type: ["morning", "evening"],
    },
  },
} as const
