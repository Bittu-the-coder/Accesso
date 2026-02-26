-- Supabase Schema for Accesso SaaS Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Text Shares Table
CREATE TABLE text_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'plaintext',
    password_hash VARCHAR(255),
    view_count INTEGER DEFAULT 0,
    max_views INTEGER,
    expires_at TIMESTAMP
    WITH
        TIME ZONE NOT NULL,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        is_public BOOLEAN DEFAULT true,
        user_ip VARCHAR(45),
        CONSTRAINT check_content_length CHECK (LENGTH(content) <= 50000)
);

-- File Shares Table
CREATE TABLE file_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    code VARCHAR(20) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    imagekit_file_id VARCHAR(255),
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER,
    expires_at TIMESTAMP
    WITH
        TIME ZONE NOT NULL,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        password_hash VARCHAR(255),
        user_ip VARCHAR(45),
        CONSTRAINT check_file_size CHECK (file_size <= 10485760) -- 10MB for free tier
);

-- URL Shortener Table
CREATE TABLE short_urls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    short_code VARCHAR(20) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    custom_alias VARCHAR(50) UNIQUE,
    title VARCHAR(255),
    click_count INTEGER DEFAULT 0,
    max_clicks INTEGER,
    expires_at TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        user_ip VARCHAR(45),
        is_active BOOLEAN DEFAULT true,
        CONSTRAINT check_url_length CHECK (LENGTH(original_url) <= 2048)
);

-- Click Analytics Table (for URL shortener)
CREATE TABLE url_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    short_url_id UUID REFERENCES short_urls (id) ON DELETE CASCADE,
    clicked_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        user_agent TEXT,
        referrer TEXT,
        ip_address VARCHAR(45),
        country VARCHAR(2),
        city VARCHAR(100)
);

-- Indexes for Performance
CREATE INDEX idx_text_shares_code ON text_shares (code);

CREATE INDEX idx_text_shares_expires_at ON text_shares (expires_at);

CREATE INDEX idx_file_shares_code ON file_shares (code);

CREATE INDEX idx_file_shares_expires_at ON file_shares (expires_at);

CREATE INDEX idx_short_urls_short_code ON short_urls (short_code);

CREATE INDEX idx_short_urls_custom_alias ON short_urls (custom_alias);

CREATE INDEX idx_url_clicks_short_url_id ON url_clicks (short_url_id);

-- Row Level Security (RLS) Policies
ALTER TABLE text_shares ENABLE ROW LEVEL SECURITY;

ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;

ALTER TABLE short_urls ENABLE ROW LEVEL SECURITY;

ALTER TABLE url_clicks ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can read with code)
CREATE POLICY "Public text shares are viewable by everyone" ON text_shares FOR
SELECT USING (
        is_public = true
        OR expires_at > NOW()
    );

CREATE POLICY "Public file shares are viewable by everyone" ON file_shares FOR
SELECT USING (expires_at > NOW());

CREATE POLICY "Public short URLs are viewable by everyone" ON short_urls FOR
SELECT USING (is_active = true);

-- Anyone can insert (anonymous sharing)
CREATE POLICY "Anyone can create text shares" ON text_shares FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "Anyone can create file shares" ON file_shares FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "Anyone can create short URLs" ON short_urls FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "Anyone can log URL clicks" ON url_clicks FOR
INSERT
WITH
    CHECK (true);

-- Allow updates (for view/download counts and content updates)
CREATE POLICY "Anyone can update text shares" ON text_shares FOR
UPDATE USING (true)
WITH
    CHECK (true);

CREATE POLICY "Anyone can update file shares" ON file_shares FOR
UPDATE USING (true)
WITH
    CHECK (true);

CREATE POLICY "Anyone can update short URLs" ON short_urls FOR
UPDATE USING (true)
WITH
    CHECK (true);

-- Allow reading click analytics
CREATE POLICY "Public click analytics are viewable" ON url_clicks FOR
SELECT USING (true);

-- Allow deleting expired content
CREATE POLICY "Anyone can delete expired text shares" ON text_shares FOR DELETE USING (expires_at < NOW());

CREATE POLICY "Anyone can delete expired file shares" ON file_shares FOR DELETE USING (expires_at < NOW());

CREATE POLICY "Anyone can delete expired short URLs" ON short_urls FOR DELETE USING (
    expires_at < NOW()
    AND expires_at IS NOT NULL
);

-- Function to auto-delete expired content
CREATE OR REPLACE FUNCTION delete_expired_content()
RETURNS void AS $$
BEGIN
  DELETE FROM text_shares WHERE expires_at < NOW();
  DELETE FROM file_shares WHERE expires_at < NOW();
  DELETE FROM short_urls WHERE expires_at < NOW() AND expires_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('delete-expired-content', '0 * * * *', 'SELECT delete_expired_content()');

-- Function to increment view/download counts
CREATE OR REPLACE FUNCTION increment_counter(
  table_name TEXT,
  counter_column TEXT,
  record_id UUID
)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1',
    table_name, counter_column, counter_column)
  USING record_id;
END;
$$ LANGUAGE plpgsql;
