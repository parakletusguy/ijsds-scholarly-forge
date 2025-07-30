export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          abstract: string
          authors: Json
          conflicts_of_interest: string | null
          corresponding_author_email: string
          created_at: string | null
          doi: string | null
          funding_info: string | null
          id: string
          issue: number | null
          keywords: string[] | null
          manuscript_file_url: string | null
          page_end: number | null
          page_start: number | null
          publication_date: string | null
          status: string | null
          subject_area: string | null
          submission_date: string | null
          title: string
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          abstract: string
          authors: Json
          conflicts_of_interest?: string | null
          corresponding_author_email: string
          created_at?: string | null
          doi?: string | null
          funding_info?: string | null
          id?: string
          issue?: number | null
          keywords?: string[] | null
          manuscript_file_url?: string | null
          page_end?: number | null
          page_start?: number | null
          publication_date?: string | null
          status?: string | null
          subject_area?: string | null
          submission_date?: string | null
          title: string
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          abstract?: string
          authors?: Json
          conflicts_of_interest?: string | null
          corresponding_author_email?: string
          created_at?: string | null
          doi?: string | null
          funding_info?: string | null
          id?: string
          issue?: number | null
          keywords?: string[] | null
          manuscript_file_url?: string | null
          page_end?: number | null
          page_start?: number | null
          publication_date?: string | null
          status?: string | null
          subject_area?: string | null
          submission_date?: string | null
          title?: string
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      editorial_decisions: {
        Row: {
          created_at: string
          decision_rationale: string | null
          decision_type: string
          editor_id: string
          id: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision_rationale?: string | null
          decision_type: string
          editor_id: string
          id?: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision_rationale?: string | null
          decision_type?: string
          editor_id?: string
          id?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          body: string
          id: string
          notification_type: string
          recipient_email: string
          recipient_id: string | null
          related_review_id: string | null
          related_submission_id: string | null
          sent_at: string
          status: string | null
          subject: string
        }
        Insert: {
          body: string
          id?: string
          notification_type: string
          recipient_email: string
          recipient_id?: string | null
          related_review_id?: string | null
          related_submission_id?: string | null
          sent_at?: string
          status?: string | null
          subject: string
        }
        Update: {
          body?: string
          id?: string
          notification_type?: string
          recipient_email?: string
          recipient_id?: string | null
          related_review_id?: string | null
          related_submission_id?: string | null
          sent_at?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      file_versions: {
        Row: {
          article_id: string
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          uploaded_by: string
          version_number: number
        }
        Insert: {
          article_id: string
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          uploaded_by: string
          version_number?: number
        }
        Update: {
          article_id?: string
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
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
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          affiliation: string | null
          bio: string | null
          created_at: string | null
          deadline_reminder_days: number | null
          email: string | null
          email_notifications_enabled: boolean | null
          full_name: string | null
          id: string
          is_editor: boolean | null
          is_reviewer: boolean | null
          orcid_id: string | null
          updated_at: string | null
        }
        Insert: {
          affiliation?: string | null
          bio?: string | null
          created_at?: string | null
          deadline_reminder_days?: number | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id: string
          is_editor?: boolean | null
          is_reviewer?: boolean | null
          orcid_id?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliation?: string | null
          bio?: string | null
          created_at?: string | null
          deadline_reminder_days?: number | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id?: string
          is_editor?: boolean | null
          is_reviewer?: boolean | null
          orcid_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rejection_messages: {
        Row: {
          created_at: string
          created_by: string
          id: string
          message: string
          submission_id: string
          suggested_corrections: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          message: string
          submission_id: string
          suggested_corrections?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          message?: string
          submission_id?: string
          suggested_corrections?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comments_to_author: string | null
          comments_to_editor: string | null
          conflict_of_interest_declared: boolean | null
          conflict_of_interest_details: string | null
          created_at: string | null
          deadline_date: string | null
          id: string
          invitation_accepted_at: string | null
          invitation_sent_at: string | null
          invitation_status: string | null
          recommendation: string | null
          review_file_url: string | null
          review_round: number | null
          reviewer_id: string | null
          submission_id: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          comments_to_author?: string | null
          comments_to_editor?: string | null
          conflict_of_interest_declared?: boolean | null
          conflict_of_interest_details?: string | null
          created_at?: string | null
          deadline_date?: string | null
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          recommendation?: string | null
          review_file_url?: string | null
          review_round?: number | null
          reviewer_id?: string | null
          submission_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          comments_to_author?: string | null
          comments_to_editor?: string | null
          conflict_of_interest_declared?: boolean | null
          conflict_of_interest_details?: string | null
          created_at?: string | null
          deadline_date?: string | null
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          recommendation?: string | null
          review_file_url?: string | null
          review_round?: number | null
          reviewer_id?: string | null
          submission_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_requests: {
        Row: {
          created_at: string
          deadline_date: string | null
          id: string
          request_details: string
          requested_by: string
          revision_type: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline_date?: string | null
          id?: string
          request_details: string
          requested_by: string
          revision_type: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline_date?: string | null
          id?: string
          request_details?: string
          requested_by?: string
          revision_type?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_by_editor: boolean | null
          article_id: string | null
          cover_letter: string | null
          editor_notes: string | null
          id: string
          reviewer_suggestions: string | null
          status: string | null
          submission_type: string | null
          submitted_at: string | null
          submitter_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_editor?: boolean | null
          article_id?: string | null
          cover_letter?: string | null
          editor_notes?: string | null
          id?: string
          reviewer_suggestions?: string | null
          status?: string | null
          submission_type?: string | null
          submitted_at?: string | null
          submitter_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_editor?: boolean | null
          article_id?: string | null
          cover_letter?: string | null
          editor_notes?: string | null
          id?: string
          reviewer_suggestions?: string | null
          status?: string | null
          submission_type?: string | null
          submitted_at?: string | null
          submitter_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
