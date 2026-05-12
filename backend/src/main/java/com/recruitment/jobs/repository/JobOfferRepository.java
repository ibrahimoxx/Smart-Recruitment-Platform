package com.recruitment.jobs.repository;

import com.recruitment.jobs.entity.JobOffer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobOfferRepository extends JpaRepository<JobOffer, UUID>, JpaSpecificationExecutor<JobOffer> {
    List<JobOffer> findByRecruiterId(UUID recruiterId);
    boolean existsByIdAndRecruiterId(UUID id, UUID recruiterId);

    @Query("SELECT j.status, COUNT(j) FROM JobOffer j GROUP BY j.status")
    List<Object[]> countByStatus();

    @Query("SELECT j.status, COUNT(j) FROM JobOffer j WHERE j.recruiter.user.id = :userId GROUP BY j.status")
    List<Object[]> countByStatusForRecruiter(@Param("userId") UUID userId);

    @Query("SELECT COUNT(j) FROM JobOffer j WHERE j.recruiter.user.id = :userId")
    long countByRecruiterUserId(@Param("userId") UUID userId);
}
