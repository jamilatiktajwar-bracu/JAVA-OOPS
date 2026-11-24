package io.storyspace;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DatabaseMigrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired Flyway flyway;

    @Test
    void migrationsCreateCoreTablesAndPlaybackResumeColumns() {
        assertThat(flyway.info().current().getVersion().getVersion()).isEqualTo("2");
        for (String table : new String[]{"accounts", "catalog_titles", "user_library", "subscriptions"}) {
            assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE LOWER(TABLE_NAME) = LOWER(?)",
                Integer.class, table)).isEqualTo(1);
        }
        for (String column : new String[]{"resume_position_seconds", "duration_seconds", "last_played_at"}) {
            assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE LOWER(TABLE_NAME) = LOWER(?) AND LOWER(COLUMN_NAME) = LOWER(?)",
                Integer.class, "user_library", column)).isEqualTo(1);
        }
    }

    @Test
    void libraryKeepsUniquenessValidationAndPlaybackConstraints() {
        assertThat(jdbc.queryForList(
            "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE LOWER(TABLE_NAME) = LOWER(?)",
            String.class, "user_library"))
            .extracting(String::toLowerCase)
            .contains("uq_user_library_account_title", "ck_user_library_progress", "ck_user_library_rating",
                      "ck_user_library_resume_position", "ck_user_library_duration");
    }
}
