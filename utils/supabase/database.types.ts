export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      flashcards: {
        Row: {
          answer: string;
          created_at: string;
          flashcards_set_id: string;
          id: string;
          question: string;
          source: Database["public"]["Enums"]["flashcard_source"];
          updated_at: string;
        };
        Insert: {
          answer: string;
          created_at?: string;
          flashcards_set_id: string;
          id?: string;
          question: string;
          source: Database["public"]["Enums"]["flashcard_source"];
          updated_at?: string;
        };
        Update: {
          answer?: string;
          created_at?: string;
          flashcards_set_id?: string;
          id?: string;
          question?: string;
          source?: Database["public"]["Enums"]["flashcard_source"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_flashcards_set_id_fkey";
            columns: ["flashcards_set_id"];
            isOneToOne: false;
            referencedRelation: "flashcards_set";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcards_set: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string | null;
          owner_id: string;
          status: Database["public"]["Enums"]["flashcards_set_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string | null;
          owner_id: string;
          status?: Database["public"]["Enums"]["flashcards_set_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string | null;
          owner_id?: string;
          status?: Database["public"]["Enums"]["flashcards_set_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      flashcards_set_shares: {
        Row: {
          created_at: string;
          flashcards_set_id: string;
          role: Database["public"]["Enums"]["share_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          flashcards_set_id: string;
          role: Database["public"]["Enums"]["share_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          flashcards_set_id?: string;
          role?: Database["public"]["Enums"]["share_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_set_shares_flashcards_set_id_fkey";
            columns: ["flashcards_set_id"];
            isOneToOne: false;
            referencedRelation: "flashcards_set";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcards_tags: {
        Row: {
          flashcard_id: string;
          tag_id: string;
        };
        Insert: {
          flashcard_id: string;
          tag_id: string;
        };
        Update: {
          flashcard_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_tags_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: false;
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flashcards_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      session_cards: {
        Row: {
          created_at: string;
          flashcard_id: string;
          rating: Database["public"]["Enums"]["session_card_rating"] | null;
          reviewed_at: string | null;
          sequence_no: number;
          session_id: string;
        };
        Insert: {
          created_at?: string;
          flashcard_id: string;
          rating?: Database["public"]["Enums"]["session_card_rating"] | null;
          reviewed_at?: string | null;
          sequence_no: number;
          session_id: string;
        };
        Update: {
          created_at?: string;
          flashcard_id?: string;
          rating?: Database["public"]["Enums"]["session_card_rating"] | null;
          reviewed_at?: string | null;
          sequence_no?: number;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_cards_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: false;
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_cards_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          created_at: string;
          duration_seconds: number | null;
          ended_at: string | null;
          flashcards_set_id: string;
          id: string;
          score: number | null;
          status: Database["public"]["Enums"]["session_status"];
          tags: string[] | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          duration_seconds?: number | null;
          ended_at?: string | null;
          flashcards_set_id: string;
          id?: string;
          score?: number | null;
          status?: Database["public"]["Enums"]["session_status"];
          tags?: string[] | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          duration_seconds?: number | null;
          ended_at?: string | null;
          flashcards_set_id?: string;
          id?: string;
          score?: number | null;
          status?: Database["public"]["Enums"]["session_status"];
          tags?: string[] | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_flashcards_set_id_fkey";
            columns: ["flashcards_set_id"];
            isOneToOne: false;
            referencedRelation: "flashcards_set";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      flashcard_source: "ai-full" | "ai-edit" | "manual";
      flashcards_set_status: "pending" | "accepted" | "rejected";
      session_card_rating: "again" | "hard" | "good" | "easy";
      session_status: "in_progress" | "completed" | "abandoned";
      share_role: "full" | "learning";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      flashcard_source: ["ai-full", "ai-edit", "manual"],
      flashcards_set_status: ["pending", "accepted", "rejected"],
      session_card_rating: ["again", "hard", "good", "easy"],
      session_status: ["in_progress", "completed", "abandoned"],
      share_role: ["full", "learning"],
    },
  },
} as const;
