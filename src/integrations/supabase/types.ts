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
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      billing_history: {
        Row: {
          amount: number
          billing_date: string
          currency: string
          id: string
          status: string
          user_id: string
          user_subscription_id: string | null
        }
        Insert: {
          amount?: number
          billing_date?: string
          currency?: string
          id?: string
          status?: string
          user_id: string
          user_subscription_id?: string | null
        }
        Update: {
          amount?: number
          billing_date?: string
          currency?: string
          id?: string
          status?: string
          user_id?: string
          user_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          bookmark_type: string
          created_at: string
          exam_template_id: string | null
          id: string
          question_id: string | null
          user_id: string
        }
        Insert: {
          bookmark_type: string
          created_at?: string
          exam_template_id?: string | null
          id?: string
          question_id?: string | null
          user_id: string
        }
        Update: {
          bookmark_type?: string
          created_at?: string
          exam_template_id?: string | null
          id?: string
          question_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_exam_template_id_fkey"
            columns: ["exam_template_id"]
            isOneToOne: false
            referencedRelation: "exam_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_topics: {
        Row: {
          chapter_id: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          topic_name_bn: string
          topic_name_en: string | null
          updated_at: string | null
        }
        Insert: {
          chapter_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          topic_name_bn: string
          topic_name_en?: string | null
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          topic_name_bn?: string
          topic_name_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          chapter_name_bn: string
          chapter_name_en: string | null
          chapter_number: number
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          subject_id: string | null
          updated_at: string | null
        }
        Insert: {
          chapter_name_bn: string
          chapter_name_en?: string | null
          chapter_number: number
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          subject_id?: string | null
          updated_at?: string | null
        }
        Update: {
          chapter_name_bn?: string
          chapter_name_en?: string | null
          chapter_number?: number
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          subject_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          applicable_plans: Json | null
          code: string
          created_at: string
          discount_percent: number
          id: string
          max_uses: number | null
          uses_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applicable_plans?: Json | null
          code: string
          created_at?: string
          discount_percent?: number
          id?: string
          max_uses?: number | null
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applicable_plans?: Json | null
          code?: string
          created_at?: string
          discount_percent?: number
          id?: string
          max_uses?: number | null
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      doubt_answers: {
        Row: {
          answer_text: string
          answerer_id: string
          created_at: string
          doubt_id: string
          helpful_count: number
          id: string
          is_best_answer: boolean
          updated_at: string
        }
        Insert: {
          answer_text: string
          answerer_id: string
          created_at?: string
          doubt_id: string
          helpful_count?: number
          id?: string
          is_best_answer?: boolean
          updated_at?: string
        }
        Update: {
          answer_text?: string
          answerer_id?: string
          created_at?: string
          doubt_id?: string
          helpful_count?: number
          id?: string
          is_best_answer?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_answers_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_helpful: {
        Row: {
          created_at: string
          doubt_answer_id: string | null
          doubt_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doubt_answer_id?: string | null
          doubt_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doubt_answer_id?: string | null
          doubt_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_helpful_doubt_answer_id_fkey"
            columns: ["doubt_answer_id"]
            isOneToOne: false
            referencedRelation: "doubt_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubt_helpful_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubts: {
        Row: {
          created_at: string
          description: string
          exam_attempt_id: string | null
          helpful_count: number
          id: string
          priority: string | null
          question_id: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["doubt_status"]
          student_id: string
          subject: string
          title: string
          topic: string | null
          updated_at: string
          views: number
        }
        Insert: {
          created_at?: string
          description: string
          exam_attempt_id?: string | null
          helpful_count?: number
          id?: string
          priority?: string | null
          question_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["doubt_status"]
          student_id: string
          subject: string
          title: string
          topic?: string | null
          updated_at?: string
          views?: number
        }
        Update: {
          created_at?: string
          description?: string
          exam_attempt_id?: string | null
          helpful_count?: number
          id?: string
          priority?: string | null
          question_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["doubt_status"]
          student_id?: string
          subject?: string
          title?: string
          topic?: string | null
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "doubts_exam_attempt_id_fkey"
            columns: ["exam_attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          answers: Json | null
          correct_answers: number
          created_at: string
          difficulty: string | null
          duration_minutes: number
          id: string
          marks_per_question: number
          max_score: number
          negative_marking: boolean
          negative_marks: number
          score: number
          skipped: number
          subject: string
          time_taken_seconds: number | null
          topic: string | null
          total_questions: number
          user_id: string
          wrong_answers: number
        }
        Insert: {
          answers?: Json | null
          correct_answers?: number
          created_at?: string
          difficulty?: string | null
          duration_minutes: number
          id?: string
          marks_per_question?: number
          max_score: number
          negative_marking?: boolean
          negative_marks?: number
          score?: number
          skipped?: number
          subject: string
          time_taken_seconds?: number | null
          topic?: string | null
          total_questions: number
          user_id: string
          wrong_answers?: number
        }
        Update: {
          answers?: Json | null
          correct_answers?: number
          created_at?: string
          difficulty?: string | null
          duration_minutes?: number
          id?: string
          marks_per_question?: number
          max_score?: number
          negative_marking?: boolean
          negative_marks?: number
          score?: number
          skipped?: number
          subject?: string
          time_taken_seconds?: number | null
          topic?: string | null
          total_questions?: number
          user_id?: string
          wrong_answers?: number
        }
        Relationships: []
      }
      exam_batch_enrollments: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_batch_enrollments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "exam_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_batches: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration_days: number
          id: string
          price: number
          seats: number
          start_date: string | null
          status: string
          subcategory_id: string | null
          template_id: string | null
          title: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          price?: number
          seats?: number
          start_date?: string | null
          status?: string
          subcategory_id?: string | null
          template_id?: string | null
          title: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          price?: number
          seats?: number
          start_date?: string | null
          status?: string
          subcategory_id?: string | null
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_batches_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_batches_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_batches_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "exam_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_templates: {
        Row: {
          attempts: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number
          features: Json
          id: string
          marks_per_question: number
          negative_marks: number
          question_count: number
          question_ids: Json
          rating: number | null
          subjects: Json
          subjects_breakdown: Json
          title: string
          topics: Json
        }
        Insert: {
          attempts?: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number
          features?: Json
          id?: string
          marks_per_question?: number
          negative_marks?: number
          question_count?: number
          question_ids?: Json
          rating?: number | null
          subjects?: Json
          subjects_breakdown?: Json
          title: string
          topics?: Json
        }
        Update: {
          attempts?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number
          features?: Json
          id?: string
          marks_per_question?: number
          negative_marks?: number
          question_count?: number
          question_ids?: Json
          rating?: number | null
          subjects?: Json
          subjects_breakdown?: Json
          title?: string
          topics?: Json
        }
        Relationships: []
      }
      live_exam_events: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          participants: number
          prize: string | null
          start_time: string
          status: string
          template_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          participants?: number
          prize?: string | null
          start_time: string
          status?: string
          template_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          participants?: number
          prize?: string | null
          start_time?: string
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_exam_events_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "exam_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_library: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          downloads: number
          file_url: string
          id: string
          is_active: boolean
          is_premium: boolean
          pages: number | null
          subject: string | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          downloads?: number
          file_url: string
          id?: string
          is_active?: boolean
          is_premium?: boolean
          pages?: number | null
          subject?: string | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          downloads?: number
          file_url?: string
          id?: string
          is_active?: boolean
          is_premium?: boolean
          pages?: number | null
          subject?: string | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          class_level: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          institution: string | null
          phone: string | null
          registration_type: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          class_level?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          institution?: string | null
          phone?: string | null
          registration_type?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          class_level?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          phone?: string | null
          registration_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proshnobank_pdfs: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          title?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          chapter_id: string | null
          correct_answer: number
          created_at: string
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string | null
          id: string
          options: Json
          question_text: string
          subject: string
          topic: string
        }
        Insert: {
          chapter_id?: string | null
          correct_answer: number
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          options?: Json
          question_text: string
          subject: string
          topic: string
        }
        Update: {
          chapter_id?: string | null
          correct_answer?: number
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          options?: Json
          question_text?: string
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          accuracy: number | null
          correct_attempts: number
          created_at: string
          id: string
          last_attempt_at: string | null
          strength: boolean | null
          subject: string
          topic: string | null
          total_attempts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          correct_attempts?: number
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          strength?: boolean | null
          subject: string
          topic?: string | null
          total_attempts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          correct_attempts?: number
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          strength?: boolean | null
          subject?: string
          topic?: string | null
          total_attempts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          batch_student_limit: number
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_doubts_per_month: number | null
          max_live_exams_per_month: number | null
          max_practice_exams: number | null
          name: string
          omr_grading: boolean
          plan_type: string
          price_monthly: number
          price_yearly: number
          question_upload_limit: number
          sort_order: number
        }
        Insert: {
          batch_student_limit?: number
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_doubts_per_month?: number | null
          max_live_exams_per_month?: number | null
          max_practice_exams?: number | null
          name: string
          omr_grading?: boolean
          plan_type: string
          price_monthly?: number
          price_yearly?: number
          question_upload_limit?: number
          sort_order?: number
        }
        Update: {
          batch_student_limit?: number
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_doubts_per_month?: number | null
          max_live_exams_per_month?: number | null
          max_practice_exams?: number | null
          name?: string
          omr_grading?: boolean
          plan_type?: string
          price_monthly?: number
          price_yearly?: number
          question_upload_limit?: number
          sort_order?: number
        }
        Relationships: []
      }
      teacher_papers: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          teacher_id: string
          title: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          teacher_id: string
          title: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          teacher_id?: string
          title?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          id: string
          month_year: string
          quantity: number
          usage_type: string
          user_id: string
        }
        Insert: {
          id?: string
          month_year: string
          quantity?: number
          usage_type: string
          user_id: string
        }
        Update: {
          id?: string
          month_year?: string
          quantity?: number
          usage_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats_cache: {
        Row: {
          accuracy: number
          avg_score: number
          last_updated: string
          rank: number | null
          total_exams: number
          total_study_time_hours: number
          user_id: string
        }
        Insert: {
          accuracy?: number
          avg_score?: number
          last_updated?: string
          rank?: number | null
          total_exams?: number
          total_study_time_hours?: number
          user_id: string
        }
        Update: {
          accuracy?: number
          avg_score?: number
          last_updated?: string
          rank?: number | null
          total_exams?: number
          total_study_time_hours?: number
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_at: string | null
          id: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          cancel_at?: string | null
          id?: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          cancel_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "moderator" | "user" | "teacher"
      difficulty_level: "easy" | "medium" | "hard"
      doubt_status: "open" | "answered" | "resolved" | "closed"
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
      app_role: ["admin", "moderator", "user", "teacher"],
      difficulty_level: ["easy", "medium", "hard"],
      doubt_status: ["open", "answered", "resolved", "closed"],
    },
  },
} as const
