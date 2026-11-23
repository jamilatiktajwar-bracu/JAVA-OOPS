package io.storyspace.security;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
@Service
public class TokenService {
 private final byte[] secret; private final long ttl;
 public TokenService(@Value("${app.security.token-secret}") String secret,@Value("${app.security.token-ttl-hours:72}") long ttlHours,@Value("${spring.profiles.active:}") String profiles){
  if(java.util.Arrays.stream(profiles.split(",")).map(String::trim).anyMatch("prod"::equalsIgnoreCase)&&secret.equals("local-development-secret-change-before-deployment-0123456789"))throw new IllegalStateException("Production must provide a unique TOKEN_SECRET.");
  this.secret=secret.getBytes(StandardCharsets.UTF_8);this.ttl=ttlHours*3600L;
  if(secret.length()<32)throw new IllegalStateException("Token secret must be at least 32 characters.");
  if(ttlHours<1||ttlHours>720)throw new IllegalStateException("Token TTL must be between 1 and 720 hours.");
 }
 public String issue(UUID userId,String role){String payload=userId+"|"+(Instant.now().getEpochSecond()+ttl)+"|"+role;
  String encoded=Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));return encoded+"."+sign(encoded);}
 public UUID validateAndGetUserId(String token){try{String[] parts=token.split("\\.",2);if(parts.length!=2||!constantTimeEquals(sign(parts[0]),parts[1]))return null;
  String payload=new String(Base64.getUrlDecoder().decode(parts[0]),StandardCharsets.UTF_8);String[] fields=payload.split("\\|",3);
  if(fields.length!=3||Long.parseLong(fields[1])<Instant.now().getEpochSecond())return null;return UUID.fromString(fields[0]);
 }catch(Exception ex){return null;}}
 private String sign(String value){try{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(secret,"HmacSHA256"));return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));}catch(Exception ex){throw new IllegalStateException(ex);}}
 private boolean constantTimeEquals(String a,String b){return java.security.MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8),b.getBytes(StandardCharsets.UTF_8));}
}