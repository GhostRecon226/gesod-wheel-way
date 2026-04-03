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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      auction_listings: {
        Row: {
          auction_date: string | null
          auction_source: string | null
          created_at: string
          id: string
          images: string[] | null
          lot_number: string | null
          make: string | null
          model: string | null
          status: Database["public"]["Enums"]["auction_status"]
          yard_location: string | null
          year: number | null
        }
        Insert: {
          auction_date?: string | null
          auction_source?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          lot_number?: string | null
          make?: string | null
          model?: string | null
          status?: Database["public"]["Enums"]["auction_status"]
          yard_location?: string | null
          year?: number | null
        }
        Update: {
          auction_date?: string | null
          auction_source?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          lot_number?: string | null
          make?: string | null
          model?: string | null
          status?: Database["public"]["Enums"]["auction_status"]
          yard_location?: string | null
          year?: number | null
        }
        Relationships: []
      }
      bid_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_id: string
          deposit_status: string | null
          id: string
          max_bid: number | null
          status: Database["public"]["Enums"]["bid_status"]
          vehicle_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_id: string
          deposit_status?: string | null
          id?: string
          max_bid?: number | null
          status?: Database["public"]["Enums"]["bid_status"]
          vehicle_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_id?: string
          deposit_status?: string | null
          id?: string
          max_bid?: number | null
          status?: Database["public"]["Enums"]["bid_status"]
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_response: string | null
          created_at: string
          customer_id: string
          description: string
          evidence_url: string | null
          id: string
          status: Database["public"]["Enums"]["dispute_status"]
          vehicle_id: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          customer_id: string
          description: string
          evidence_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["dispute_status"]
          vehicle_id?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          customer_id?: string
          description?: string
          evidence_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["dispute_status"]
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          type: string | null
          uploaded_by: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          type?: string | null
          uploaded_by?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          type?: string | null
          uploaded_by?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          confirmed_by: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          customer_id: string
          id: string
          payment_date: string | null
          stage: string | null
          status: Database["public"]["Enums"]["payment_status"]
          vehicle_id: string | null
        }
        Insert: {
          amount: number
          confirmed_by?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          customer_id: string
          id?: string
          payment_date?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          vehicle_id?: string | null
        }
        Update: {
          amount?: number
          confirmed_by?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          customer_id?: string
          id?: string
          payment_date?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          admin_notes: string | null
          amount_ngn: number | null
          amount_usd: number | null
          created_at: string
          customer_id: string
          id: string
          status: Database["public"]["Enums"]["quote_status"]
          type: Database["public"]["Enums"]["quote_type"]
          valid_until: string | null
          vehicle_details: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount_ngn?: number | null
          amount_usd?: number | null
          created_at?: string
          customer_id: string
          id?: string
          status?: Database["public"]["Enums"]["quote_status"]
          type: Database["public"]["Enums"]["quote_type"]
          valid_until?: string | null
          vehicle_details?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount_ngn?: number | null
          amount_usd?: number | null
          created_at?: string
          customer_id?: string
          id?: string
          status?: Database["public"]["Enums"]["quote_status"]
          type?: Database["public"]["Enums"]["quote_type"]
          valid_until?: string | null
          vehicle_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sailing_schedules: {
        Row: {
          created_at: string
          departure_port: string | null
          destination_port:
            | Database["public"]["Enums"]["destination_port"]
            | null
          eta_nigeria: string | null
          etd: string | null
          id: string
          status: Database["public"]["Enums"]["sailing_status"]
          vessel_name: string
        }
        Insert: {
          created_at?: string
          departure_port?: string | null
          destination_port?:
            | Database["public"]["Enums"]["destination_port"]
            | null
          eta_nigeria?: string | null
          etd?: string | null
          id?: string
          status?: Database["public"]["Enums"]["sailing_status"]
          vessel_name: string
        }
        Update: {
          created_at?: string
          departure_port?: string | null
          destination_port?:
            | Database["public"]["Enums"]["destination_port"]
            | null
          eta_nigeria?: string | null
          etd?: string | null
          id?: string
          status?: Database["public"]["Enums"]["sailing_status"]
          vessel_name?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      vehicle_milestones: {
        Row: {
          created_at: string
          evidence_url: string | null
          id: string
          notes: string | null
          stage: string
          updated_by: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          stage: string
          updated_by?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          stage?: string
          updated_by?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_milestones_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_milestones_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          auction_date: string | null
          auction_source: string | null
          created_at: string
          customer_id: string | null
          damage_description: string | null
          id: string
          lot_number: string | null
          make: string | null
          model: string | null
          odometer: number | null
          run_and_drive: boolean | null
          status: string | null
          title_type: string | null
          vin: string | null
          yard_location: string | null
          year: number | null
        }
        Insert: {
          auction_date?: string | null
          auction_source?: string | null
          created_at?: string
          customer_id?: string | null
          damage_description?: string | null
          id?: string
          lot_number?: string | null
          make?: string | null
          model?: string | null
          odometer?: number | null
          run_and_drive?: boolean | null
          status?: string | null
          title_type?: string | null
          vin?: string | null
          yard_location?: string | null
          year?: number | null
        }
        Update: {
          auction_date?: string | null
          auction_source?: string | null
          created_at?: string
          customer_id?: string | null
          damage_description?: string | null
          id?: string
          lot_number?: string | null
          make?: string | null
          model?: string | null
          odometer?: number | null
          run_and_drive?: boolean | null
          status?: string | null
          title_type?: string | null
          vin?: string | null
          yard_location?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "customer" | "admin"
      auction_status: "active" | "expired"
      bid_status: "pending" | "approved" | "rejected" | "won" | "lost"
      currency_type: "USD" | "NGN"
      destination_port: "Apapa" | "Tin Can" | "Onne"
      dispute_status: "open" | "under_review" | "resolved"
      payment_status: "pending" | "confirmed"
      quote_status: "pending" | "issued" | "accepted" | "expired"
      quote_type: "ocean" | "inland"
      sailing_status: "scheduled" | "departed" | "arrived"
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
      app_role: ["customer", "admin"],
      auction_status: ["active", "expired"],
      bid_status: ["pending", "approved", "rejected", "won", "lost"],
      currency_type: ["USD", "NGN"],
      destination_port: ["Apapa", "Tin Can", "Onne"],
      dispute_status: ["open", "under_review", "resolved"],
      payment_status: ["pending", "confirmed"],
      quote_status: ["pending", "issued", "accepted", "expired"],
      quote_type: ["ocean", "inland"],
      sailing_status: ["scheduled", "departed", "arrived"],
    },
  },
} as const
