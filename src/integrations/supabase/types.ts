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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      auction_listings: {
        Row: {
          auction_date: string | null
          auction_source: string | null
          body_style: string | null
          created_at: string
          damage_description: string | null
          drivetrain: string | null
          engine: string | null
          estimated_value: number | null
          exterior_color: string | null
          fuel_type: string | null
          has_keys: boolean | null
          id: string
          images: string[] | null
          interior_color: string | null
          lot_number: string | null
          make: string | null
          model: string | null
          odometer: number | null
          primary_damage: string | null
          run_and_drive: boolean | null
          secondary_damage: string | null
          status: Database["public"]["Enums"]["auction_status"]
          title_type: string | null
          transmission: string | null
          vin: string | null
          yard_location: string | null
          year: number | null
        }
        Insert: {
          auction_date?: string | null
          auction_source?: string | null
          body_style?: string | null
          created_at?: string
          damage_description?: string | null
          drivetrain?: string | null
          engine?: string | null
          estimated_value?: number | null
          exterior_color?: string | null
          fuel_type?: string | null
          has_keys?: boolean | null
          id?: string
          images?: string[] | null
          interior_color?: string | null
          lot_number?: string | null
          make?: string | null
          model?: string | null
          odometer?: number | null
          primary_damage?: string | null
          run_and_drive?: boolean | null
          secondary_damage?: string | null
          status?: Database["public"]["Enums"]["auction_status"]
          title_type?: string | null
          transmission?: string | null
          vin?: string | null
          yard_location?: string | null
          year?: number | null
        }
        Update: {
          auction_date?: string | null
          auction_source?: string | null
          body_style?: string | null
          created_at?: string
          damage_description?: string | null
          drivetrain?: string | null
          engine?: string | null
          estimated_value?: number | null
          exterior_color?: string | null
          fuel_type?: string | null
          has_keys?: boolean | null
          id?: string
          images?: string[] | null
          interior_color?: string | null
          lot_number?: string | null
          make?: string | null
          model?: string | null
          odometer?: number | null
          primary_damage?: string | null
          run_and_drive?: boolean | null
          secondary_damage?: string | null
          status?: Database["public"]["Enums"]["auction_status"]
          title_type?: string | null
          transmission?: string | null
          vin?: string | null
          yard_location?: string | null
          year?: number | null
        }
        Relationships: []
      }
      auction_watchlist: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          notified_end_at: string | null
          notified_start_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          notified_end_at?: string | null
          notified_start_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          notified_end_at?: string | null
          notified_start_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_watchlist_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "auction_listings"
            referencedColumns: ["id"]
          },
        ]
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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          read: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read?: boolean
        }
        Relationships: []
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
          review_notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          type: string | null
          uploaded_by: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          type?: string | null
          uploaded_by?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          type?: string | null
          uploaded_by?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
      driver_payments: {
        Row: {
          amount: number | null
          driver_id: string | null
          id: string
          load_id: string | null
          method: string | null
          notes: string | null
          paid_date: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          driver_id?: string | null
          id?: string
          load_id?: string | null
          method?: string | null
          notes?: string | null
          paid_date?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          driver_id?: string | null
          id?: string
          load_id?: string | null
          method?: string | null
          notes?: string | null
          paid_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_payments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_payments_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_details: string | null
          payment_method: string | null
          phone: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_details?: string | null
          payment_method?: string | null
          phone?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_details?: string | null
          payment_method?: string | null
          phone?: string | null
        }
        Relationships: []
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
      invoice_line_items: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          invoice_id: string | null
          load_id: string | null
          type: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          load_id?: string | null
          type?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          load_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_loads: {
        Row: {
          id: string
          invoice_id: string | null
          load_id: string | null
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          load_id?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string | null
          load_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_loads_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_loads_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          notes: string | null
          paid_at: string | null
          sent_at: string | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      load_status_history: {
        Row: {
          created_at: string | null
          id: string
          load_id: string | null
          notes: string | null
          status: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          load_id?: string | null
          notes?: string | null
          status?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          load_id?: string | null
          notes?: string | null
          status?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "load_status_history_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_status_history_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loads: {
        Row: {
          agreed_pickup_price: number | null
          buyer_number: string | null
          created_at: string | null
          customer_id: string | null
          destination_address: string | null
          destination_type: string | null
          driver_id: string | null
          id: string
          lot_number: string | null
          make: string | null
          model: string | null
          notes: string | null
          pickup_location: string | null
          service_fee: number | null
          status: string | null
          vin: string
          year: number | null
        }
        Insert: {
          agreed_pickup_price?: number | null
          buyer_number?: string | null
          created_at?: string | null
          customer_id?: string | null
          destination_address?: string | null
          destination_type?: string | null
          driver_id?: string | null
          id?: string
          lot_number?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          pickup_location?: string | null
          service_fee?: number | null
          status?: string | null
          vin: string
          year?: number | null
        }
        Update: {
          agreed_pickup_price?: number | null
          buyer_number?: string | null
          created_at?: string | null
          customer_id?: string | null
          destination_address?: string | null
          destination_type?: string | null
          driver_id?: string | null
          id?: string
          lot_number?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          pickup_location?: string | null
          service_fee?: number | null
          status?: string | null
          vin?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loads_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
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
      email_queue_dispatch: { Args: never; Returns: undefined }
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
      track_vehicle_by_vin: { Args: { _vin: string }; Returns: Json }
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
