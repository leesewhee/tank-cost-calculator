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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      document_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      document_files: {
        Row: {
          category_id: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          memo: string
          original_name: string
          project_name: string
          used_date: string
        }
        Insert: {
          category_id: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          memo?: string
          original_name?: string
          project_name?: string
          used_date?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          memo?: string
          original_name?: string
          project_name?: string
          used_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_files_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      drawings: {
        Row: {
          created_at: string
          drawing_name: string
          drawing_number: string
          id: string
          project_id: string
          revision: string
          revision_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          drawing_name: string
          drawing_number: string
          id?: string
          project_id: string
          revision?: string
          revision_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          drawing_name?: string
          drawing_number?: string
          id?: string
          project_id?: string
          revision?: string
          revision_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drawings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ncr_inspection_items: {
        Row: {
          created_at: string
          drawing_number: string
          id: string
          issue_count: string
          item_no: number
          item_remarks: string
          report_id: string
        }
        Insert: {
          created_at?: string
          drawing_number?: string
          id?: string
          issue_count?: string
          item_no?: number
          item_remarks?: string
          report_id: string
        }
        Update: {
          created_at?: string
          drawing_number?: string
          id?: string
          issue_count?: string
          item_no?: number
          item_remarks?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ncr_inspection_items_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "ncr_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      ncr_reports: {
        Row: {
          action_department: string
          action_discard: boolean
          action_modify: boolean
          action_return: boolean
          action_rework: boolean
          action_sort: boolean
          actions: string
          approved_by: string
          construction_name: string
          construction_no: string
          created_at: string
          equipment_name: string
          final_result: string
          id: string
          inspection_date: string
          inspection_location: string
          inspector: string
          issues: string
          processing_period: string
          project_id: string
          reinspection_result: string
          remarks: string
          reviewed_by: string
          updated_at: string
          written_by: string
        }
        Insert: {
          action_department?: string
          action_discard?: boolean
          action_modify?: boolean
          action_return?: boolean
          action_rework?: boolean
          action_sort?: boolean
          actions?: string
          approved_by?: string
          construction_name?: string
          construction_no?: string
          created_at?: string
          equipment_name?: string
          final_result?: string
          id?: string
          inspection_date?: string
          inspection_location?: string
          inspector?: string
          issues?: string
          processing_period?: string
          project_id: string
          reinspection_result?: string
          remarks?: string
          reviewed_by?: string
          updated_at?: string
          written_by?: string
        }
        Update: {
          action_department?: string
          action_discard?: boolean
          action_modify?: boolean
          action_return?: boolean
          action_rework?: boolean
          action_sort?: boolean
          actions?: string
          approved_by?: string
          construction_name?: string
          construction_no?: string
          created_at?: string
          equipment_name?: string
          final_result?: string
          id?: string
          inspection_date?: string
          inspection_location?: string
          inspector?: string
          issues?: string
          processing_period?: string
          project_id?: string
          reinspection_result?: string
          remarks?: string
          reviewed_by?: string
          updated_at?: string
          written_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ncr_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_date: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_date: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_date?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
