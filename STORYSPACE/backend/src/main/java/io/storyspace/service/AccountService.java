package io.storyspace.service;
import io.storyspace.accounts.*;import io.storyspace.api.ApiDtos.*;import io.storyspace.security.TokenService;import org.springframework.security.crypto.password.PasswordEncoder;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import java.util.Arrays;import java.util.List;
@Service
public class AccountService {
 private final AccountRepository repo;private final PasswordEncoder encoder;private final TokenService tokens;
 public AccountService(AccountRepository repo,PasswordEncoder encoder,TokenService tokens){this.repo=repo;this.encoder=encoder;this.tokens=tokens;}
 @Transactional public AuthResponse register(RegisterRequest r){String email=r.email().trim().toLowerCase();if(repo.existsByEmailIgnoreCase(email))throw new IllegalArgumentException("An account with this email already exists.");
  Account a=repo.save(new Account(email,encoder.encode(r.password()),r.displayName().trim()));return response(a);}
 public AuthResponse login(LoginRequest r){Account a=repo.findByEmailIgnoreCase(r.email().trim()).orElseThrow(()->new IllegalArgumentException("Email or password is incorrect."));
  if(!encoder.matches(r.password(),a.getPasswordHash()))throw new IllegalArgumentException("Email or password is incorrect.");return response(a);}
 public Profile profile(Account a){return new Profile(a.getId(),a.getEmail(),a.getDisplayName(),a.getRole(),split(a.getFavoriteGenres()),split(a.getFavoriteMoods()),split(a.getPreferredLanguages()));}
 @Transactional public Profile update(Account a,PreferenceRequest r){a.updateProfile(r.displayName().trim(),join(r.genres()),join(r.moods()),join(r.languages()));return profile(repo.save(a));}
 private AuthResponse response(Account a){return new AuthResponse(tokens.issue(a.getId(),a.getRole()),profile(a));}
 private List<String> split(String s){return s==null||s.isBlank()?List.of():Arrays.stream(s.split(",")).map(String::trim).filter(v->!v.isBlank()).toList();}
 private String join(List<String> list){return list==null?"":list.stream().map(String::trim).filter(s->!s.isBlank()).distinct().limit(20).reduce((a,b)->a+","+b).orElse("");}
}