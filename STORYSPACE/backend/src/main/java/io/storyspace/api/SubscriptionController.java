package io.storyspace.api;
import io.storyspace.service.*;import org.springframework.web.bind.annotation.*;import java.util.Map;
@RestController @RequestMapping("/api/subscriptions")public class SubscriptionController {private final CurrentAccount current;private final SubscriptionService service;public SubscriptionController(CurrentAccount c,SubscriptionService s){current=c;service=s;}
 @GetMapping("/plans")public Object plans(){return service.plans();}
 @GetMapping("/me")public Object current(){return service.current(current.require());}
 @PostMapping("/activate")public Object activate(@RequestBody Map<String,String> body){return service.activate(current.require(),body.get("plan"));}
 @PostMapping("/cancel")public Object cancel(){return service.cancel(current.require());}
}