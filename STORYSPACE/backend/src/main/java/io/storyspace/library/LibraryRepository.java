package io.storyspace.library;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.List;import java.util.Optional;import java.util.UUID;
public interface LibraryRepository extends JpaRepository<LibraryItem,UUID>{List<LibraryItem> findByAccountId(UUID accountId);Optional<LibraryItem> findByAccountIdAndTitleId(UUID accountId,UUID titleId);}