package io.storyspace.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;

import static org.junit.jupiter.api.Assertions.*;

class CorsConfigTest {
    @Test
    void onlyConfiguredOriginsAreAllowed() {
        CorsConfiguration configuration = new CorsConfig("https://app.example,capacitor://localhost")
                .corsSource()
                .getCorsConfiguration(new MockHttpServletRequest("GET", "/api/profile"));

        assertNotNull(configuration);
        assertEquals("https://app.example", configuration.checkOrigin("https://app.example"));
        assertEquals("capacitor://localhost", configuration.checkOrigin("capacitor://localhost"));
        assertNull(configuration.checkOrigin("https://untrusted.example"));
        assertNull(configuration.checkOrigin("null"));
        assertFalse(configuration.getAllowCredentials());
    }

    @Test
    void rejectsAnEmptyOriginConfiguration() {
        assertThrows(IllegalStateException.class, () -> new CorsConfig(" , "));
    }
}
