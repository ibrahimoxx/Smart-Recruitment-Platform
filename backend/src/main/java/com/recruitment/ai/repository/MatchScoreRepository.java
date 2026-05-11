package com.recruitment.ai.repository;

import com.recruitment.ai.entity.MatchScore;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchScoreRepository extends JpaRepository<MatchScore, UUID> {

    boolean existsByApplicationId(UUID applicationId);

    Optional<MatchScore> findByApplicationId(UUID applicationId);
}
