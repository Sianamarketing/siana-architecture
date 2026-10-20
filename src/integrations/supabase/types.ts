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
      cities: {
        Row: {
          canonical_url: string | null
          center_latitude: number | null
          center_longitude: number | null
          country: string | null
          created_at: string
          default_zoom: number | null
          description: string | null
          hero_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          name: string
          og_image_url: string | null
          region: string | null
          sections: Json
          slug: string
          status: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          center_latitude?: number | null
          center_longitude?: number | null
          country?: string | null
          created_at?: string
          default_zoom?: number | null
          description?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name: string
          og_image_url?: string | null
          region?: string | null
          sections?: Json
          slug: string
          status?: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          center_latitude?: number | null
          center_longitude?: number | null
          country?: string | null
          created_at?: string
          default_zoom?: number | null
          description?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          og_image_url?: string | null
          region?: string | null
          sections?: Json
          slug?: string
          status?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          body: string | null
          canonical_url: string | null
          category: string | null
          city_tags: string[]
          created_at: string
          excerpt: string | null
          hero_image_url: string | null
          id: string
          kind: string
          linked_project_ids: string[]
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          canonical_url?: string | null
          category?: string | null
          city_tags?: string[]
          created_at?: string
          excerpt?: string | null
          hero_image_url?: string | null
          id?: string
          kind?: string
          linked_project_ids?: string[]
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          canonical_url?: string | null
          category?: string | null
          city_tags?: string[]
          created_at?: string
          excerpt?: string | null
          hero_image_url?: string | null
          id?: string
          kind?: string
          linked_project_ids?: string[]
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string | null
          architect: string | null
          canonical_url: string | null
          category: string | null
          city_id: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          era: string | null
          featured: boolean
          gallery: Json
          hero_image_url: string | null
          id: string
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          og_image_url: string | null
          practice: string | null
          slug: string
          status: string
          style: string | null
          tagline: string | null
          updated_at: string
          year_completed: number | null
          siana_pick: string | null
          analysis: string | null
          tldr: string | null
          curious_facts: Json
          why_section: Json
          stats: Json
          condition: string | null
          heritage_status: string | null
          year_listed: number | null
        }
        Insert: {
          address?: string | null
          architect?: string | null
          canonical_url?: string | null
          category?: string | null
          city_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          era?: string | null
          featured?: boolean
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          og_image_url?: string | null
          practice?: string | null
          slug: string
          status?: string
          style?: string | null
          tagline?: string | null
          updated_at?: string
          year_completed?: number | null
          siana_pick?: string | null
          analysis?: string | null
          tldr?: string | null
          curious_facts?: Json
          why_section?: Json
          stats?: Json
          condition?: string | null
          heritage_status?: string | null
          year_listed?: number | null
        }
        Update: {
          address?: string | null
          architect?: string | null
          canonical_url?: string | null
          category?: string | null
          city_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          era?: string | null
          featured?: boolean
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          og_image_url?: string | null
          practice?: string | null
          slug?: string
          status?: string
          style?: string | null
          tagline?: string | null
          updated_at?: string
          year_completed?: number | null
          siana_pick?: string | null
          analysis?: string | null
          tldr?: string | null
          curious_facts?: Json
          why_section?: Json
          stats?: Json
          condition?: string | null
          heritage_status?: string | null
          year_listed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      project_images: {
        Row: {
          alt: string
          attribution: string
          author: string
          caption: string | null
          created_at: string
          height: number | null
          id: string
          is_hero: boolean
          kind: string | null
          license: string
          license_url: string | null
          original_url: string | null
          permission_status: string
          position: number
          project_id: string
          source_url: string
          storage_path: string | null
          width: number | null
        }
        Insert: {
          alt: string
          attribution: string
          author: string
          caption?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_hero?: boolean
          kind?: string | null
          license: string
          license_url?: string | null
          original_url?: string | null
          permission_status?: string
          position?: number
          project_id: string
          source_url: string
          storage_path?: string | null
          width?: number | null
        }
        Update: {
          alt?: string
          attribution?: string
          author?: string
          caption?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_hero?: boolean
          kind?: string | null
          license?: string
          license_url?: string | null
          original_url?: string | null
          permission_status?: string
          position?: number
          project_id?: string
          source_url?: string
          storage_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_links: {
        Row: {
          category: string
          id: string
          language: string | null
          last_checked_at: string | null
          last_status: number | null
          note: string | null
          position: number
          project_id: string
          published_on: string | null
          publisher: string | null
          title: string
          url: string | null
        }
        Insert: {
          category: string
          id?: string
          language?: string | null
          last_checked_at?: string | null
          last_status?: number | null
          note?: string | null
          position?: number
          project_id: string
          published_on?: string | null
          publisher?: string | null
          title: string
          url?: string | null
        }
        Update: {
          category?: string
          id?: string
          language?: string | null
          last_checked_at?: string | null
          last_status?: number | null
          note?: string | null
          position?: number
          project_id?: string
          published_on?: string | null
          publisher?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_graphics: {
        Row: {
          alt: string | null
          caption: string | null
          created_at: string
          download_label: string | null
          download_path: string | null
          downloadable: boolean
          id: string
          kind: string
          position: number
          project_id: string
          slug: string | null
          storage_path: string | null
          svg_path: string | null
        }
        Insert: {
          alt?: string | null
          caption?: string | null
          created_at?: string
          download_label?: string | null
          download_path?: string | null
          downloadable?: boolean
          id?: string
          kind?: string
          position?: number
          project_id: string
          slug?: string | null
          storage_path?: string | null
          svg_path?: string | null
        }
        Update: {
          alt?: string | null
          caption?: string | null
          created_at?: string
          download_label?: string | null
          download_path?: string | null
          downloadable?: boolean
          id?: string
          kind?: string
          position?: number
          project_id?: string
          slug?: string | null
          storage_path?: string | null
          svg_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_graphics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_globals: {
        Row: {
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          page_key: string
          robots: string
          updated_at: string
        }
        Insert: {
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          page_key: string
          robots?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          page_key?: string
          robots?: string
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "viewer"
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
      app_role: ["admin", "viewer"],
    },
  },
} as const
