package io.storyspace.config;
import io.storyspace.accounts.*;import io.storyspace.catalog.*;import org.springframework.beans.factory.annotation.Value;import org.springframework.boot.CommandLineRunner;import org.springframework.context.annotation.Bean;import org.springframework.context.annotation.Configuration;import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration public class SeedData {
 @Bean CommandLineRunner seed(TitleRepository titles,AccountRepository accounts,PasswordEncoder encoder,@Value("${app.bootstrap.admin-email}")String adminEmail,@Value("${app.bootstrap.admin-password}")String adminPassword){return args->{
  if(titles.count()==0){
   titles.save(new Title("quiet-orbit","Quiet Orbit","A radio astronomer receives a message that changes how she sees the stars—and the people beside her.","Sci-Fi,Drama","Curious,Reflective,Hopeful","English",2026,"13+","SERIES",9.1,"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=85","",true,true));
   titles.save(new Title("salt-and-sky","Salt & Sky","Two strangers find a new beginning along a coastline where the weather has its own memory.","Romance,Drama","Comforting,Soft,Hopeful","English",2025,"13+","FILM",8.4,"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85","",true,true));
   titles.save(new Title("the-last-garden","The Last Garden","A botanist uncovers an unexpected community beneath a forgotten city greenhouse.","Mystery,Adventure","Curious,Wonder,Adventure","English",2025,"13+","FILM",8.7,"https://images.unsplash.com/photo-1476231682828-37e571bc5bcd?auto=format&fit=crop&w=900&q=85","",false,true));
   titles.save(new Title("blue-hour","Blue Hour","An ensemble of friends reconnects in the hours before a city-wide blackout.","Drama,Thriller","Thoughtful,Tense,Emotional","English",2024,"16+","SERIES",8.6,"https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85","",false,true));
   titles.save(new Title("wild-current","Wild Current","A marine rescue team follows a migrating pod and finds a mystery in the deep.","Adventure,Documentary","Nature,Wonder,Adventure","English",2025,"7+","FILM",8.5,"https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85","",true,true));
   titles.save(new Title("paper-moon","Paper Moon","A small bookshop becomes the unlikely meeting point for a neighborhood in transition.","Drama,Family","Comforting,Feel-good,Reflective","English",2024,"7+","SERIES",8.3,"https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85","",false,true));
  }
  if(adminEmail!=null&&!adminEmail.isBlank()&&adminPassword!=null&&!adminPassword.isBlank()&&!accounts.existsByEmailIgnoreCase(adminEmail)){
   Account admin=accounts.save(new Account(adminEmail.trim().toLowerCase(),encoder.encode(adminPassword),"Platform Admin"));admin.setRole("ADMIN");accounts.save(admin);
  }
 };}}
