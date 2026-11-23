package io.storyspace.catalog;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.List;import java.util.UUID;
public interface TitleRepository extends JpaRepository<Title,UUID>{List<Title> findByPublishedTrueOrderByNameAsc();List<Title> findByFeaturedTrueAndPublishedTrue();boolean existsBySlug(String slug);}