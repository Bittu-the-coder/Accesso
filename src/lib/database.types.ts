export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      text_shares: {
        Row: {
          id: string;
          code: string;
          title: string | null;
          content: string;
          language: string;
          password_hash: string | null;
          view_count: number;
          max_views: number | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
          is_public: boolean;
          user_ip: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          title?: string | null;
          content: string;
          language?: string;
          password_hash?: string | null;
          view_count?: number;
          max_views?: number | null;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
          user_ip?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string | null;
          content?: string;
          language?: string;
          password_hash?: string | null;
          view_count?: number;
          max_views?: number | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
          user_ip?: string | null;
        };
      };
      file_shares: {
        Row: {
          id: string;
          code: string;
          filename: string;
          original_filename: string;
          file_url: string;
          file_size: number;
          mime_type: string | null;
          imagekit_file_id: string | null;
          download_count: number;
          max_downloads: number | null;
          expires_at: string;
          created_at: string;
          password_hash: string | null;
          user_ip: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          filename: string;
          original_filename: string;
          file_url: string;
          file_size: number;
          mime_type?: string | null;
          imagekit_file_id?: string | null;
          download_count?: number;
          max_downloads?: number | null;
          expires_at: string;
          created_at?: string;
          password_hash?: string | null;
          user_ip?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          filename?: string;
          original_filename?: string;
          file_url?: string;
          file_size?: number;
          mime_type?: string | null;
          imagekit_file_id?: string | null;
          download_count?: number;
          max_downloads?: number | null;
          expires_at?: string;
          created_at?: string;
          password_hash?: string | null;
          user_ip?: string | null;
        };
      };
      short_urls: {
        Row: {
          id: string;
          short_code: string;
          original_url: string;
          custom_alias: string | null;
          title: string | null;
          click_count: number;
          max_clicks: number | null;
          expires_at: string | null;
          created_at: string;
          user_ip: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          short_code: string;
          original_url: string;
          custom_alias?: string | null;
          title?: string | null;
          click_count?: number;
          max_clicks?: number | null;
          expires_at?: string | null;
          created_at?: string;
          user_ip?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          short_code?: string;
          original_url?: string;
          custom_alias?: string | null;
          title?: string | null;
          click_count?: number;
          max_clicks?: number | null;
          expires_at?: string | null;
          created_at?: string;
          user_ip?: string | null;
          is_active?: boolean;
        };
      };
      url_clicks: {
        Row: {
          id: string;
          short_url_id: string;
          clicked_at: string;
          user_agent: string | null;
          referrer: string | null;
          ip_address: string | null;
          country: string | null;
          city: string | null;
        };
        Insert: {
          id?: string;
          short_url_id: string;
          clicked_at?: string;
          user_agent?: string | null;
          referrer?: string | null;
          ip_address?: string | null;
          country?: string | null;
          city?: string | null;
        };
        Update: {
          id?: string;
          short_url_id?: string;
          clicked_at?: string;
          user_agent?: string | null;
          referrer?: string | null;
          ip_address?: string | null;
          country?: string | null;
          city?: string | null;
        };
      };
    };
  };
}
