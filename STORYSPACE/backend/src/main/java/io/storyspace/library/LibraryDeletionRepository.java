package io.storyspace.library;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.List;import java.util.Optional;import java.util.UUID;
public interface LibraryDeletionRepository extends JpaRepository<LibraryDeletion,UUID>{List<LibraryDeletion> findByAccount_Id(UUID accountId);Optional<LibraryDeletion> findByAccount_IdAndTitle_Id(UUID accountId,UUID titleId);}
