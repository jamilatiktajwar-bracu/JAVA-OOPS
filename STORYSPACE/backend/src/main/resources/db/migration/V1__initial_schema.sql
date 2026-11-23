-- Initial Storyspace persistence schema. Compatible with PostgreSQL and H2.
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    favorite_genres VARCHAR(1000) NOT NULL DEFAULT '',
    favorite_moods VARCHAR(1000) NOT NULL DEFAULT '',
    preferred_languages VARCHAR(500) NOT NULL DEFAULT 'English',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE TABLE catalog_titles (
    id UUID PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    synopsis VARCHAR(2500) NOT NULL,
    genres VARCHAR(500) NOT NULL DEFAULT '',
    moods VARCHAR(500) NOT NULL DEFAULT '',
    language VARCHAR(60) NOT NULL DEFAULT 'English',
    release_year INTEGER NOT NULL,
    age_rating VARCHAR(255) DEFAULT '13+',
    format VARCHAR(255) DEFAULT 'FILM',
    community_score DOUBLE PRECISION DEFAULT 7.5,
    poster_url VARCHAR(1000) DEFAULT '',
    backdrop_url VARCHAR(1000) DEFAULT '',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    original BOOLEAN NOT NULL DEFAULT FALSE,
    published BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE user_library (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    title_id UUID NOT NULL,
    state VARCHAR(255) NOT NULL DEFAULT 'WATCHLIST',
    progress_percent INTEGER NOT NULL DEFAULT 0,
    user_rating INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_user_library_account FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT fk_user_library_title FOREIGN KEY (title_id) REFERENCES catalog_titles(id),
    CONSTRAINT uq_user_library_account_title UNIQUE (account_id, title_id),
    CONSTRAINT ck_user_library_progress CHECK (progress_percent BETWEEN 0 AND 100),
    CONSTRAINT ck_user_library_rating CHECK (user_rating IS NULL OR user_rating BETWEEN 1 AND 10)
);
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    plan_key VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_subscriptions_account FOREIGN KEY (account_id) REFERENCES accounts(id)
);
CREATE INDEX idx_catalog_titles_published ON catalog_titles(published);
CREATE INDEX idx_catalog_titles_featured ON catalog_titles(featured);
CREATE INDEX idx_user_library_account ON user_library(account_id);
CREATE INDEX idx_user_library_title ON user_library(title_id);
CREATE INDEX idx_subscriptions_account_status ON subscriptions(account_id, status);
