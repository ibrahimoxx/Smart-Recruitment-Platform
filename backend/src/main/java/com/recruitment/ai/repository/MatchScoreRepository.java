package com.recruitment.ai.repository;

import com.recruitment.ai.entity.MatchScore;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchScoreRepository extends JpaRepository<MatchScore, UUID> {

    boolean existsByApplicationId(UUID applicationId);

    Optional<MatchScore> findByApplicationId(UUID applicationId);

    @Query("SELECT AVG(m.score) FROM MatchScore m")
    Double avgScore();

    @Query("""
            SELECT AVG(m.score)
            FROM MatchScore m, Application a
            WHERE a.id = m.applicationId
              AND a.jobOffer.recruiter.user.id = :userId
            """)
    Double avgScoreForRecruiter(@Param("userId") UUID userId);
}
