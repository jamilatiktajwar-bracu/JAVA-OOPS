-- Store an account-scoped playback position so Continue Watching can resume across devices.
ALTER TABLE user_library
    ADD COLUMN resume_position_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN duration_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN last_played_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE user_library
    ADD CONSTRAINT ck_user_library_resume_position CHECK (resume_position_seconds >= 0 AND resume_position_seconds <= duration_seconds),
    ADD CONSTRAINT ck_user_library_duration CHECK (duration_seconds >= 0 AND duration_seconds <= 86400);

CREATE INDEX idx_user_library_account_last_played
    ON user_library(account_id, last_played_at);