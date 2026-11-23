package io.storyspace.service;
import io.storyspace.accounts.Account;import io.storyspace.catalog.*;import io.storyspace.api.ApiDtos.TitleDto;import io.storyspace.library.LibraryRepository;import org.springframework.stereotype.Service;import java.util.*;
@Service public class RecommendationService {
 private final TitleRepository titles;private final LibraryRepository library;
 public RecommendationService(TitleRepository titles,LibraryRepository library){this.titles=titles;this.library=library;}
 public List<TitleDto> forUser(Account user){Set<UUID> hidden=new HashSet<>();library.findByAccountId(user.getId()).forEach(x->{if("COMPLETED".equals(x.getState()))hidden.add(x.getTitle().getId());});
  Set<String> genres=words(user.getFavoriteGenres()),moods=words(user.getFavoriteMoods()),langs=words(user.getPreferredLanguages());
  return titles.findByPublishedTrueOrderByNameAsc().stream().filter(t->!hidden.contains(t.getId())).sorted(Comparator.comparingDouble((Title t)->score(t,genres,moods,langs)).reversed()).map(this::dto).toList();}
 private double score(Title t,Set<String> g,Set<String> m,Set<String> l){double s=t.getCommunityScore();for(String x:words(t.getGenres()))if(g.contains(x))s+=2.5;for(String x:words(t.getMoods()))if(m.contains(x))s+=2;for(String x:words(t.getLanguage()))if(l.contains(x))s+=1.3;if(t.isFeatured())s+=.7;if(t.isOriginal())s+=.4;return s;}
 private Set<String> words(String s){if(s==null)return Set.of();return Arrays.stream(s.toLowerCase(Locale.ROOT).split("[,|]")).map(String::trim).filter(x->!x.isBlank()).collect(java.util.stream.Collectors.toSet());}
 public TitleDto dto(Title t){return new TitleDto(t.getId(),t.getSlug(),t.getName(),t.getSynopsis(),new ArrayList<>(words(t.getGenres())),new ArrayList<>(words(t.getMoods())),t.getLanguage(),t.getReleaseYear(),t.getAgeRating(),t.getFormat(),t.getCommunityScore(),t.getPosterUrl(),t.getBackdropUrl(),t.isFeatured(),t.isOriginal());}
}