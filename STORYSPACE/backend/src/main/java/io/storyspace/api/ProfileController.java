package io.storyspace.api;
import io.storyspace.api.ApiDtos.*;import io.storyspace.service.*;import org.springframework.web.bind.annotation.*;import jakarta.validation.Valid;
@RestController @RequestMapping("/api/profile")public class ProfileController {private final CurrentAccount current;private final AccountService service;public ProfileController(CurrentAccount c,AccountService s){current=c;service=s;}
 @GetMapping public Profile me(){return service.profile(current.require());}
 @PutMapping("/preferences")public Profile update(@Valid @RequestBody PreferenceRequest r){return service.update(current.require(),r);}
}