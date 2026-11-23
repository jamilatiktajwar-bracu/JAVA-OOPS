package io.storyspace;
import com.fasterxml.jackson.databind.JsonNode;import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;import org.springframework.boot.test.context.SpringBootTest;import org.springframework.http.MediaType;import org.springframework.test.web.servlet.MockMvc;import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:storyspace-api;DB_CLOSE_DELAY=-1","app.security.token-secret=test-secret-key-which-is-at-least-32-chars-long"})
@AutoConfigureMockMvc class PlatformApiIntegrationTest {
 @Autowired MockMvc mvc;@Autowired ObjectMapper mapper;
 @Test void catalogSearchRejectsBlankAndOversizedQueries()throws Exception{
  mvc.perform(get("/api/catalog/search").param("q","   ")).andExpect(status().isBadRequest());
  mvc.perform(get("/api/catalog/search").param("q","x".repeat(81))).andExpect(status().isBadRequest());
  mvc.perform(get("/api/catalog/search").param("q","Signal")).andExpect(status().isOk());
 }
 @Test void registrationRejectsMissingPassword()throws Exception{
  mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(java.util.Map.of("email","missing-password@example.test","displayName","No Password")))).andExpect(status().isBadRequest());
 }
 @Test void accountPreferencesLibraryAndDemoPlanFlow()throws Exception{
  String email="tester-"+System.nanoTime()+"@example.test";
  MvcResult register=mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(java.util.Map.of("email",email,"password","strong-password-123","displayName","Test Explorer")))).andExpect(status().isOk()).andReturn();
  JsonNode auth=mapper.readTree(register.getResponse().getContentAsString());String token=auth.get("token").asText();String bearer="Bearer "+token;
  mvc.perform(get("/api/profile").header("Authorization",bearer)).andExpect(status().isOk()).andExpect(jsonPath("$.displayName").value("Test Explorer"));
  mvc.perform(put("/api/profile/preferences").header("Authorization",bearer).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(java.util.Map.of("displayName","Test Explorer","genres",java.util.List.of("Sci-Fi"),"moods",java.util.List.of("Curious"),"languages",java.util.List.of("English"))))).andExpect(status().isOk()).andExpect(jsonPath("$.genres[0]").value("Sci-Fi"));
  MvcResult catalog=mvc.perform(get("/api/catalog")).andExpect(status().isOk()).andReturn();JsonNode first=mapper.readTree(catalog.getResponse().getContentAsString()).get(0);String titleId=first.get("id").asText();
  mvc.perform(get("/api/catalog/for-you").header("Authorization",bearer)).andExpect(status().isOk());
  mvc.perform(put("/api/library/"+titleId).header("Authorization",bearer)).andExpect(status().isOk());
  mvc.perform(get("/api/library").header("Authorization",bearer)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
  mvc.perform(post("/api/subscriptions/activate").header("Authorization",bearer).contentType(MediaType.APPLICATION_JSON).content("{\"plan\":\"PLUS\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.plan").value("PLUS"));
  mvc.perform(get("/api/subscriptions/me").header("Authorization",bearer)).andExpect(status().isOk()).andExpect(jsonPath("$.plan").value("PLUS"));
  mvc.perform(get("/api/admin/metrics").header("Authorization",bearer)).andExpect(status().isForbidden());
 }
}