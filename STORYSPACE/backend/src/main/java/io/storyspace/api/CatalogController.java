package io.storyspace.api;
import io.storyspace.api.ApiDtos.*;import io.storyspace.catalog.*;import io.storyspace.service.*;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api/catalog")public class CatalogController {private final TitleRepository titles;private final RecommendationService recommender;private final CurrentAccount current;public CatalogController(TitleRepository t,RecommendationService r,CurrentAccount c){titles=t;recommender=r;current=c;}
 @GetMapping public List<TitleDto> all(){return titles.findByPublishedTrueOrderByNameAsc().stream().map(recommender::dto).toList();}
 @GetMapping("/featured")public List<TitleDto> featured(){return titles.findByFeaturedTrueAndPublishedTrue().stream().map(recommender::dto).toList();}
 @GetMapping("/for-you")public List<TitleDto> forYou(){return recommender.forUser(current.require());}
 @GetMapping("/search")public List<TitleDto> search(@RequestParam String q){String needle=q.toLowerCase();return titles.findByPublishedTrueOrderByNameAsc().stream().filter(t->(t.getName()+" "+t.getSynopsis()+" "+t.getGenres()+" "+t.getMoods()).toLowerCase().contains(needle)).map(recommender::dto).toList();}
}