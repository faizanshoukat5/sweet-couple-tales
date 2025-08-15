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
      album_memories: {
        Row: {
          album_id: string | null
          created_at: string | null
          id: string
          memory_id: string | null
        }
        Insert: {
          album_id?: string | null
          created_at?: string | null
          id?: string
          memory_id?: string | null
        }
        Update: {
          album_id?: string | null
          created_at?: string | null
          id?: string
          memory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "album_memories_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_memories_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      album_photos: {
        Row: {
          album_id: string | null
          created_at: string | null
          id: string
          url: string
        }
        Insert: {
          album_id?: string | null
          created_at?: string | null
          id?: string
          url: string
        }
        Update: {
          album_id?: string | null
          created_at?: string | null
          id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      couples: {
        Row: {
          id: string
          requested_at: string
          requested_by: string
          responded_at: string | null
          status: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          id?: string
          requested_at?: string
          requested_by: string
          responded_at?: string | null
          status?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          id?: string
          requested_at?: string
          requested_by?: string
          responded_at?: string | null
          status?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      custom_quiz_attempts: {
        Row: {
          answers: Json
          attempted_at: string
          creator_id: string | null
          id: string
          quiz_id: string | null
          taker_id: string | null
        }
        Insert: {
          answers: Json
          attempted_at?: string
          creator_id?: string | null
          id?: string
          quiz_id?: string | null
          taker_id?: string | null
        }
        Update: {
          answers?: Json
          attempted_at?: string
          creator_id?: string | null
          id?: string
          quiz_id?: string | null
          taker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "custom_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_quizzes: {
        Row: {
          created_at: string
          creator_id: string | null
          id: string
          partner_id: string | null
          quiz: Json
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          id?: string
          partner_id?: string | null
          quiz: Json
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          id?: string
          partner_id?: string | null
          quiz?: Json
        }
        Relationships: [
          {
            foreignKeyName: "custom_quizzes_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "custom_quizzes_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      date_idea_favorites: {
        Row: {
          favorited_at: string | null
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          favorited_at?: string | null
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          favorited_at?: string | null
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_idea_favorites_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "date_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      date_idea_ratings: {
        Row: {
          created_at: string | null
          id: string
          idea_id: string
          rating: number | null
          review: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          idea_id: string
          rating?: number | null
          review?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          idea_id?: string
          rating?: number | null
          review?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_idea_ratings_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "date_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      date_ideas: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          title?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          completed: boolean
          created_at: string | null
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string | null
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      important_dates: {
        Row: {
          created_at: string | null
          date: string
          id: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      love_language_quiz_results: {
        Row: {
          id: string
          partner_id: string | null
          scores: Json
          shared_with_partner: boolean | null
          taken_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          partner_id?: string | null
          scores: Json
          shared_with_partner?: boolean | null
          taken_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          partner_id?: string | null
          scores?: Json
          shared_with_partner?: boolean | null
          taken_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      love_notes: {
        Row: {
          author_id: string
          couple_id: string
          created_at: string
          id: string
          note: string
        }
        Insert: {
          author_id: string
          couple_id: string
          created_at?: string
          id?: string
          note: string
        }
        Update: {
          author_id?: string
          couple_id?: string
          created_at?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "love_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "love_notes_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          memory_date: string
          photos: string[] | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          memory_date: string
          photos?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          memory_date?: string
          photos?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_filename: string | null
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          delivered_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          receiver_id: string
          reply_to: string | null
          sender_id: string
          timestamp: string
          voice_duration: number | null
        }
        Insert: {
          attachment_filename?: string | null
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          delivered_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          receiver_id: string
          reply_to?: string | null
          sender_id: string
          timestamp?: string
          voice_duration?: number | null
        }
        Update: {
          attachment_filename?: string | null
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          delivered_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          receiver_id?: string
          reply_to?: string | null
          sender_id?: string
          timestamp?: string
          voice_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      moods: {
        Row: {
          created_at: string
          date: string
          id: string
          mood: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          mood: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          mood?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      period_cycles: {
        Row: {
          id: string
          user_id: string
          cycle_start_date: string
          cycle_length: number
          period_length: number
          symptoms: string[]
          mood: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cycle_start_date: string
          cycle_length: number
          period_length: number
          symptoms?: string[]
          mood?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cycle_start_date?: string
          cycle_length?: number
          period_length?: number
          symptoms?: string[]
          mood?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "period_cycles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_emoji: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          first_goal: string | null
          id: string
          partner_name: string | null
          relationship_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_emoji?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_goal?: string | null
          id?: string
          partner_name?: string | null
          relationship_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_emoji?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_goal?: string | null
          id?: string
          partner_name?: string | null
          relationship_start_date?: string | null
          updated_at?: string
          user_id?: string
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
