package io.storyspace.security;
import io.storyspace.accounts.AccountRepository;
import jakarta.servlet.FilterChain;import jakarta.servlet.ServletException;import jakarta.servlet.http.HttpServletRequest;import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;import org.springframework.stereotype.Component;import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;import java.util.List;
@Component
public class TokenAuthFilter extends OncePerRequestFilter {
 private final TokenService tokens;private final AccountRepository accounts;
 public TokenAuthFilter(TokenService tokens,AccountRepository accounts){this.tokens=tokens;this.accounts=accounts;}
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String header=req.getHeader("Authorization");if(header!=null&&header.startsWith("Bearer ")){var id=tokens.validateAndGetUserId(header.substring(7));
   if(id!=null)accounts.findById(id).ifPresent(account->{var auth=new UsernamePasswordAuthenticationToken(account.getEmail(),null,List.of(new SimpleGrantedAuthority("ROLE_"+account.getRole())));SecurityContextHolder.getContext().setAuthentication(auth);});
  }chain.doFilter(req,res);
 }
}