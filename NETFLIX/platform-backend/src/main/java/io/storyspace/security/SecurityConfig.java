package io.storyspace.security;
import org.springframework.context.annotation.Bean;import org.springframework.context.annotation.Configuration;import org.springframework.security.config.annotation.web.builders.HttpSecurity;import org.springframework.security.config.http.SessionCreationPolicy;import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;import org.springframework.security.crypto.password.PasswordEncoder;import org.springframework.security.web.SecurityFilterChain;import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean SecurityFilterChain security(HttpSecurity http,TokenAuthFilter tokenFilter)throws Exception{
  return http.csrf(c->c.disable()).cors(c->{}).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a.requestMatchers("/api/auth/**","/api/catalog/**","/api/health","/error").permitAll().anyRequest().authenticated())
   .addFilterBefore(tokenFilter,UsernamePasswordAuthenticationFilter.class).build();
 }
}