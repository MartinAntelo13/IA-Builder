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
      approvals: {
        Row: {
          comment: string | null
          decided_at: string
          decided_by: string
          decision: Database["public"]["Enums"]["decision_type"]
          id: string
          organization_id: string
          request_id: string
          request_step_id: string
          revision: number
          step_activated_at: string | null
          step_due_at: string | null
        }
        Insert: {
          comment?: string | null
          decided_at?: string
          decided_by: string
          decision: Database["public"]["Enums"]["decision_type"]
          id?: string
          organization_id: string
          request_id: string
          request_step_id: string
          revision: number
          step_activated_at?: string | null
          step_due_at?: string | null
        }
        Update: {
          comment?: string | null
          decided_at?: string
          decided_by?: string
          decision?: Database["public"]["Enums"]["decision_type"]
          id?: string
          organization_id?: string
          request_id?: string
          request_step_id?: string
          revision?: number
          step_activated_at?: string | null
          step_due_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_decided_by_organization_id_fkey"
            columns: ["decided_by", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "approvals_request_id_organization_id_fkey"
            columns: ["request_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "approvals_request_step_id_request_id_fkey"
            columns: ["request_step_id", "request_id"]
            isOneToOne: false
            referencedRelation: "request_steps"
            referencedColumns: ["id", "request_id"]
          },
        ]
      }
      attachments: {
        Row: {
          checksum: string | null
          created_at: string
          file_name: string
          id: string
          mime_type: string
          organization_id: string
          request_id: string
          size_bytes: number
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          file_name: string
          id?: string
          mime_type: string
          organization_id: string
          request_id: string
          size_bytes: number
          storage_path: string
          uploaded_by: string
        }
        Update: {
          checksum?: string | null
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string
          organization_id?: string
          request_id?: string
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_request_id_organization_id_fkey"
            columns: ["request_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_organization_id_fkey"
            columns: ["uploaded_by", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          new_data: Json | null
          old_data: Json | null
          organization_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          organization_id: string
          request_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          organization_id: string
          request_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          organization_id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_organization_id_fkey"
            columns: ["author_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "comments_request_id_organization_id_fkey"
            columns: ["request_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          code: string
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_department_id_organization_id_fkey"
            columns: ["department_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "cost_centers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          consumed_at: string | null
          created_at: string
          department_id: string | null
          email: string
          expires_at: string
          full_name: string
          id: string
          invited_by: string | null
          job_title: string | null
          manager_id: string | null
          organization_id: string
          role_id: string
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          expires_at?: string
          full_name: string
          id?: string
          invited_by?: string | null
          job_title?: string | null
          manager_id?: string | null
          organization_id: string
          role_id: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          expires_at?: string
          full_name?: string
          id?: string
          invited_by?: string | null
          job_title?: string | null
          manager_id?: string | null
          organization_id?: string
          role_id?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_department_id_organization_id_fkey"
            columns: ["department_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "invitations_invited_by_organization_id_fkey"
            columns: ["invited_by", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "invitations_manager_id_organization_id_fkey"
            columns: ["manager_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_id_organization_id_fkey"
            columns: ["role_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          dedupe_key: string | null
          delivery_status: Database["public"]["Enums"]["delivery_status"]
          id: string
          organization_id: string
          payload: Json
          read_at: string | null
          request_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          dedupe_key?: string | null
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          id?: string
          organization_id: string
          payload?: Json
          read_at?: string | null
          request_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          dedupe_key?: string | null
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          id?: string
          organization_id?: string
          payload?: Json
          read_at?: string | null
          request_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_request_id_organization_id_fkey"
            columns: ["request_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notifications_user_id_organization_id_fkey"
            columns: ["user_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          currency_code: string
          currency_symbol: string
          description: string | null
          domain: string | null
          id: string
          name: string
          slug: string
          support_email: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          currency_symbol?: string
          description?: string | null
          domain?: string | null
          id?: string
          name: string
          slug: string
          support_email?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          currency_symbol?: string
          description?: string | null
          domain?: string | null
          id?: string
          name?: string
          slug?: string
          support_email?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          description: string
        }
        Insert: {
          code: string
          description: string
        }
        Update: {
          code?: string
          description?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department_id: string | null
          email: string
          full_name: string
          id: string
          invited_by: string | null
          job_title: string | null
          last_active_at: string | null
          manager_id: string | null
          organization_id: string
          status: Database["public"]["Enums"]["profile_status"]
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          full_name: string
          id: string
          invited_by?: string | null
          job_title?: string | null
          last_active_at?: string | null
          manager_id?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["profile_status"]
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          full_name?: string
          id?: string
          invited_by?: string | null
          job_title?: string | null
          last_active_at?: string | null
          manager_id?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["profile_status"]
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_organization_id_fkey"
            columns: ["department_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "profiles_invited_by_organization_id_fkey"
            columns: ["invited_by", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "profiles_manager_id_organization_id_fkey"
            columns: ["manager_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      request_counters: {
        Row: {
          last_value: number
          organization_id: string
        }
        Insert: {
          last_value?: number
          organization_id: string
        }
        Update: {
          last_value?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      request_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: number
          metadata: Json
          organization_id: string
          request_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: never
          metadata?: Json
          organization_id: string
          request_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: never
          metadata?: Json
          organization_id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_events_actor_id_organization_id_fkey"
            columns: ["actor_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "request_events_request_id_organization_id_fkey"
            columns: ["request_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      request_steps: {
        Row: {
          activated_at: string | null
          approver_type: Database["public"]["Enums"]["approver_type"]
          assigned_to: string | null
          created_at: string
          decided_at: string | null
          due_at: string | null
          id: string
          label: string
          organization_id: string
          position: number
          request_id: string
          role_id: string | null
          sla_hours: number | null
          status: Database["public"]["Enums"]["step_status"]
          updated_at: string
          workflow_step_id: string | null
        }
        Insert: {
          activated_at?: string | null
          approver_type: Database["public"]["Enums"]["approver_type"]
          assigned_to?: string | null
          created_at?: string
          decided_at?: string | null
          due_at?: string | null
          id?: string
          label: string
          organization_id: string
          position: number
          request_id: string
          role_id?: string | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["step_status"]
          updated_at?: string
          workflow_step_id?: string | null
        }
        Update: {
          activated_at?: string | null
          approver_type?: Database["public"]["Enums"]["approver_type"]
          assigned_to?: string | null
          created_at?: string
          decided_at?: string | null
          due_at?: string | null
          id?: string
          label?: string
          organization_id?: string
          position?: number
          request_id?: string
          role_id?: string | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["step_status"]
          updated_at?: string
          workflow_step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_steps_assigned_to_organization_id_fkey"
            columns: ["assigned_to", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "request_steps_request_id_organization_id_fkey"
            columns: ["request_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "request_steps_role_id_organization_id_fkey"
            columns: ["role_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "request_steps_workflow_step_id_fkey"
            columns: ["workflow_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      request_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          requires_amount: boolean
          sort_order: number
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          requires_amount?: boolean
          sort_order?: number
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          requires_amount?: boolean
          sort_order?: number
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_types_workflow_id_organization_id_fkey"
            columns: ["workflow_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      requests: {
        Row: {
          amount: number | null
          code: string | null
          completed_at: string | null
          cost_center_id: string | null
          created_at: string
          currency_code: string
          current_step_id: string | null
          description: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          request_seq: number
          request_type_id: string
          requester_id: string
          required_date: string | null
          revision: number
          status: Database["public"]["Enums"]["request_status"]
          submitted_at: string | null
          title: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          amount?: number | null
          code?: string | null
          completed_at?: string | null
          cost_center_id?: string | null
          created_at?: string
          currency_code: string
          current_step_id?: string | null
          description?: string | null
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["priority_level"]
          request_seq: number
          request_type_id: string
          requester_id: string
          required_date?: string | null
          revision?: number
          status?: Database["public"]["Enums"]["request_status"]
          submitted_at?: string | null
          title: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          amount?: number | null
          code?: string | null
          completed_at?: string | null
          cost_center_id?: string | null
          created_at?: string
          currency_code?: string
          current_step_id?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          request_seq?: number
          request_type_id?: string
          requester_id?: string
          required_date?: string | null
          revision?: number
          status?: Database["public"]["Enums"]["request_status"]
          submitted_at?: string | null
          title?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_cost_center_id_organization_id_fkey"
            columns: ["cost_center_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "requests_current_step_fk"
            columns: ["current_step_id", "id"]
            isOneToOne: false
            referencedRelation: "request_steps"
            referencedColumns: ["id", "request_id"]
          },
          {
            foreignKeyName: "requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_request_type_id_organization_id_fkey"
            columns: ["request_type_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "request_types"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "requests_requester_id_organization_id_fkey"
            columns: ["requester_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "requests_workflow_id_organization_id_fkey"
            columns: ["workflow_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          organization_id: string
          permission_code: string
          role_id: string
        }
        Insert: {
          organization_id: string
          permission_code: string
          role_id: string
        }
        Update: {
          organization_id?: string
          permission_code?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "role_permissions_role_id_organization_id_fkey"
            columns: ["role_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          organization_id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          organization_id: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          organization_id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_organization_id_fkey"
            columns: ["role_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_organization_id_fkey"
            columns: ["user_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          approver_type: Database["public"]["Enums"]["approver_type"]
          created_at: string
          id: string
          label: string
          organization_id: string
          position: number
          role_id: string | null
          sla_hours: number | null
          updated_at: string
          user_id: string | null
          workflow_id: string
        }
        Insert: {
          approver_type: Database["public"]["Enums"]["approver_type"]
          created_at?: string
          id?: string
          label: string
          organization_id: string
          position: number
          role_id?: string | null
          sla_hours?: number | null
          updated_at?: string
          user_id?: string | null
          workflow_id: string
        }
        Update: {
          approver_type?: Database["public"]["Enums"]["approver_type"]
          created_at?: string
          id?: string
          label?: string
          organization_id?: string
          position?: number
          role_id?: string | null
          sla_hours?: number | null
          updated_at?: string
          user_id?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_role_id_organization_id_fkey"
            columns: ["role_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "workflow_steps_user_id_organization_id_fkey"
            columns: ["user_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "workflow_steps_workflow_id_organization_id_fkey"
            columns: ["workflow_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_created_by_organization_id_fkey"
            columns: ["created_by", "organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_request: {
        Args: { p_reason?: string; p_request_id: string }
        Returns: {
          amount: number | null
          code: string | null
          completed_at: string | null
          cost_center_id: string | null
          created_at: string
          currency_code: string
          current_step_id: string | null
          description: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          request_seq: number
          request_type_id: string
          requester_id: string
          required_date: string | null
          revision: number
          status: Database["public"]["Enums"]["request_status"]
          submitted_at: string | null
          title: string
          updated_at: string
          workflow_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      decide_request: {
        Args: {
          p_comment?: string
          p_decision: Database["public"]["Enums"]["decision_type"]
          p_request_id: string
        }
        Returns: {
          amount: number | null
          code: string | null
          completed_at: string | null
          cost_center_id: string | null
          created_at: string
          currency_code: string
          current_step_id: string | null
          description: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          request_seq: number
          request_type_id: string
          requester_id: string
          required_date: string | null
          revision: number
          status: Database["public"]["Enums"]["request_status"]
          submitted_at: string | null
          title: string
          updated_at: string
          workflow_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      duplicate_workflow: {
        Args: { p_name?: string; p_workflow_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "workflows"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_dashboard_kpis: {
        Args: never
        Returns: {
          active_delta_pct: number
          active_requests: number
          approval_rate_delta_pts: number
          approval_rate_pct: number
          avg_approval_days: number
          avg_approval_days_delta: number
          awaiting_my_review: number
          submitted_last_30d: number
          submitted_prev_30d: number
        }[]
      }
      get_inbox_kpis: {
        Args: never
        Returns: {
          avg_response_days: number
          high_priority_count: number
          pending_count: number
          sla_compliance_pct: number
        }[]
      }
      get_request_detail: { Args: { p_request_id: string }; Returns: Json }
      get_team_summary: {
        Args: never
        Returns: {
          active_members: number
          added_last_30d: number
          pending_invitations: number
          roles_count: number
          total_members: number
        }[]
      }
      invite_member: {
        Args: {
          p_department_id?: string
          p_email: string
          p_full_name: string
          p_job_title?: string
          p_manager_id?: string
          p_role_code: string
        }
        Returns: {
          consumed_at: string | null
          created_at: string
          department_id: string | null
          email: string
          expires_at: string
          full_name: string
          id: string
          invited_by: string | null
          job_title: string | null
          manager_id: string | null
          organization_id: string
          role_id: string
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      list_inbox: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_search?: string
          p_sort?: string
          p_tab?: string
        }
        Returns: {
          amount: number
          code: string
          currency_code: string
          currency_symbol: string
          description: string
          is_overdue: boolean
          my_decided_at: string
          my_decision: Database["public"]["Enums"]["decision_type"]
          priority: Database["public"]["Enums"]["priority_level"]
          request_id: string
          request_type_code: string
          requester_id: string
          requester_name: string
          status: Database["public"]["Enums"]["request_status"]
          step_activated_at: string
          step_due_at: string
          step_id: string
          step_label: string
          title: string
          total_count: number
        }[]
      }
      list_requests: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_scope?: string
          p_search?: string
          p_status?: Database["public"]["Enums"]["request_status"][]
        }
        Returns: {
          amount: number
          code: string
          created_at: string
          currency_code: string
          currency_symbol: string
          current_step_label: string
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          request_type_code: string
          request_type_name: string
          requester_id: string
          requester_name: string
          status: Database["public"]["Enums"]["request_status"]
          submitted_at: string
          title: string
          total_count: number
          updated_at: string
        }[]
      }
      list_team_members: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_role_code?: string
          p_search?: string
          p_status?: Database["public"]["Enums"]["profile_status"]
        }
        Returns: {
          created_at: string
          department_name: string
          email: string
          full_name: string
          id: string
          job_title: string
          last_active_at: string
          role_codes: string[]
          role_names: string[]
          status: Database["public"]["Enums"]["profile_status"]
          total_count: number
        }[]
      }
      reorder_workflow_steps: {
        Args: { p_step_ids: string[]; p_workflow_id: string }
        Returns: undefined
      }
      resubmit_request: {
        Args: { p_comment?: string; p_request_id: string }
        Returns: {
          amount: number | null
          code: string | null
          completed_at: string | null
          cost_center_id: string | null
          created_at: string
          currency_code: string
          current_step_id: string | null
          description: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          request_seq: number
          request_type_id: string
          requester_id: string
          required_date: string | null
          revision: number
          status: Database["public"]["Enums"]["request_status"]
          submitted_at: string | null
          title: string
          updated_at: string
          workflow_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      revoke_invitation: {
        Args: { p_invitation_id: string }
        Returns: undefined
      }
      save_workflow: {
        Args: {
          p_description: string
          p_name: string
          p_steps: Json
          p_workflow_id: string
        }
        Returns: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "workflows"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_request: {
        Args: { p_request_id: string }
        Returns: {
          amount: number | null
          code: string | null
          completed_at: string | null
          cost_center_id: string | null
          created_at: string
          currency_code: string
          current_step_id: string | null
          description: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          request_seq: number
          request_type_id: string
          requester_id: string
          required_date: string | null
          revision: number
          status: Database["public"]["Enums"]["request_status"]
          submitted_at: string | null
          title: string
          updated_at: string
          workflow_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_member: {
        Args: {
          p_department_id?: string
          p_job_title?: string
          p_manager_id?: string
          p_role_codes: string[]
          p_status: Database["public"]["Enums"]["profile_status"]
          p_user_id: string
        }
        Returns: {
          avatar_url: string | null
          created_at: string
          department_id: string | null
          email: string
          full_name: string
          id: string
          invited_by: string | null
          job_title: string | null
          last_active_at: string | null
          manager_id: string | null
          organization_id: string
          status: Database["public"]["Enums"]["profile_status"]
          timezone: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      approver_type: "role" | "requester_manager" | "user"
      decision_type: "approved" | "rejected" | "changes_requested"
      delivery_status: "pending" | "sent" | "failed" | "skipped"
      event_type:
        | "created"
        | "submitted"
        | "step_assigned"
        | "approved"
        | "rejected"
        | "changes_requested"
        | "resubmitted"
        | "cancelled"
        | "commented"
        | "attachment_added"
      invitation_status: "pending" | "consumed" | "revoked" | "expired"
      notification_channel: "in_app" | "email"
      notification_type:
        | "step_assigned"
        | "request_approved"
        | "request_rejected"
        | "changes_requested"
        | "request_cancelled"
        | "reminder"
      priority_level: "low" | "normal" | "high"
      profile_status: "invited" | "active" | "disabled"
      request_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "changes_requested"
        | "approved"
        | "rejected"
        | "cancelled"
      step_status:
        | "pending"
        | "active"
        | "approved"
        | "rejected"
        | "changes_requested"
        | "skipped"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      approver_type: ["role", "requester_manager", "user"],
      decision_type: ["approved", "rejected", "changes_requested"],
      delivery_status: ["pending", "sent", "failed", "skipped"],
      event_type: [
        "created",
        "submitted",
        "step_assigned",
        "approved",
        "rejected",
        "changes_requested",
        "resubmitted",
        "cancelled",
        "commented",
        "attachment_added",
      ],
      invitation_status: ["pending", "consumed", "revoked", "expired"],
      notification_channel: ["in_app", "email"],
      notification_type: [
        "step_assigned",
        "request_approved",
        "request_rejected",
        "changes_requested",
        "request_cancelled",
        "reminder",
      ],
      priority_level: ["low", "normal", "high"],
      profile_status: ["invited", "active", "disabled"],
      request_status: [
        "draft",
        "submitted",
        "in_review",
        "changes_requested",
        "approved",
        "rejected",
        "cancelled",
      ],
      step_status: [
        "pending",
        "active",
        "approved",
        "rejected",
        "changes_requested",
        "skipped",
      ],
    },
  },
} as const
