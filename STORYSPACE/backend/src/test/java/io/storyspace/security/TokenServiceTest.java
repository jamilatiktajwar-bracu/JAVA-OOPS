package io.storyspace.security;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TokenServiceTest {
    private static final String TEST_SECRET = "test-secret-that-is-at-least-thirty-two-characters";

    @Test
    void signsAndValidatesTokens() {
        TokenService service = new TokenService(TEST_SECRET, 72, "");
        UUID userId = UUID.randomUUID();
        String token = service.issue(userId, "USER");

        assertEquals(userId, service.validateAndGetUserId(token));
        assertNull(service.validateAndGetUserId(token + "x"));
        assertNull(service.validateAndGetUserId("bad"));
    }

    @Test
    void rejectsDevelopmentSecretInProduction() {
        assertThrows(IllegalStateException.class, () ->
                new TokenService("local-development-secret-change-before-deployment-0123456789", 72, "prod"));
    }

    @Test
    void rejectsOutOfRangeTokenLifetimes() {
        assertThrows(IllegalStateException.class, () -> new TokenService(TEST_SECRET, 0, ""));
        assertThrows(IllegalStateException.class, () -> new TokenService(TEST_SECRET, 721, ""));
    }
}
