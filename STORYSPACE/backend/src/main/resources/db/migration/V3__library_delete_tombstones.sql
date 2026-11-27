-- Preserve account-scoped removals so stale offline devices cannot resurrect deleted titles.
CREATE TABLE user_library_deletions (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    title_id UUID NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_library_deletions_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_library_deletions_title FOREIGN KEY (title_id) REFERENCES catalog_titles(id) ON DELETE CASCADE,
    CONSTRAINT uq_library_deletions_account_title UNIQUE (account_id, title_id)
);
CREATE INDEX idx_library_deletions_account_updated
    ON user_library_deletions(account_id, updated_at);
