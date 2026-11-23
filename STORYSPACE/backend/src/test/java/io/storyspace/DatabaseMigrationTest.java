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
    void initialMigrationCreatesCoreTablesAndHistory() {
        assertThat(flyway.info().current().getVersion().getVersion()).isEqualTo("1");
        for (String table : new String[]{"accounts", "catalog_titles", "user_library", "subscriptions"}) {
            assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE LOWER(TABLE_NAME) = LOWER(?)",
                Integer.class, table)).isEqualTo(1);
        }
    }
}
