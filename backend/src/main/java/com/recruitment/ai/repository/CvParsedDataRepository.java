package com.recruitment.ai.repository;

import com.recruitment.ai.entity.CvParsedData;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CvParsedDataRepository extends JpaRepository<CvParsedData, UUID> {

    Optional<CvParsedData> findByCandidateIdAndSourceObjectKey(UUID candidateId, String sourceObjectKey);

    Optional<CvParsedData> findTopByCandidateIdOrderByParsedAtDesc(UUID candidateId);
}
