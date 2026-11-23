package io.storyspace.api;
import io.storyspace.api.ApiDtos.*;import io.storyspace.service.*;import org.springframework.web.bind.annotation.*;import jakarta.validation.Valid;
@RestController @RequestMapping("/api/auth")
public class AuthController {private final AccountService service;public AuthController(AccountService s){service=s;}
 @PostMapping("/register")public AuthResponse register(@Valid @RequestBody RegisterRequest r){return service.register(r);}
 @PostMapping("/login")public AuthResponse login(@Valid @RequestBody LoginRequest r){return service.login(r);}
}