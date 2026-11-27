package io.storyspace;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:storyspace-concurrent-library;DB_CLOSE_DELAY=-1","app.security.token-secret=test-secret-key-which-is-at-least-32-chars-long"})
@AutoConfigureMockMvc
class LibraryConcurrencyIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @Test
    void concurrentProgressWritesNeverCorruptTheLibraryRow() throws Exception {
        String email = "concurrent-" + System.nanoTime() + "@example.test";
        MvcResult registered = mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("email", email, "password", "strong-password-123", "displayName", "Concurrent Tester"))))
            .andReturn();
        assertThat(registered.getResponse().getStatus()).isEqualTo(200);
        String bearer = "Bearer " + mapper.readTree(registered.getResponse().getContentAsString()).get("token").asText();

        JsonNode firstTitle = mapper.readTree(mvc.perform(get("/api/catalog")).andReturn().getResponse().getContentAsString()).get(0);
        String titleId = firstTitle.get("id").asText();
        mvc.perform(put("/api/library/" + titleId).header("Authorization", bearer)).andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk());

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<Integer> first = pool.submit(() -> updateProgress(bearer, titleId, 25, ready, start));
            Future<Integer> second = pool.submit(() -> updateProgress(bearer, titleId, 75, ready, start));
            ready.await();
            start.countDown();
            int firstStatus = first.get();
            int secondStatus = second.get();
            assertThat(firstStatus).isIn(200, 409);
            assertThat(secondStatus).isIn(200, 409);
            assertThat(firstStatus == 200 || secondStatus == 200).isTrue();

            JsonNode library = mapper.readTree(mvc.perform(get("/api/library").header("Authorization", bearer))
                .andReturn().getResponse().getContentAsString());
            assertThat(library.size()).isEqualTo(1);
            int progress = library.get(0).get("progressPercent").asInt();
            assertThat(progress).isIn(25, 75);
        } finally {
            pool.shutdownNow();
        }
    }

    private int updateProgress(String bearer, String titleId, int progress,
                               CountDownLatch ready, CountDownLatch start) throws Exception {
        ready.countDown();
        start.await();
        return mvc.perform(patch("/api/library/" + titleId + "/progress")
                .header("Authorization", bearer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("progressPercent", progress))))
            .andReturn().getResponse().getStatus();
    }
}
