package com.recruitment.applications.repository;

import com.recruitment.applications.entity.Application;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    boolean existsByCandidateIdAndJobOfferId(UUID candidateId, UUID jobOfferId);

    Page<Application> findByCandidateUserId(UUID userId, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.jobOffer.recruiter.user.id = :recruiterId")
    Page<Application> findByRecruiterUserId(@Param("recruiterId") UUID recruiterId, Pageable pageable);

    Page<Application> findByJobOfferId(UUID jobOfferId, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.jobOffer.id = :jobOfferId AND a.jobOffer.recruiter.user.id = :recruiterId")
    Page<Application> findByJobOfferIdAndRecruiterUserId(
            @Param("jobOfferId") UUID jobOfferId,
            @Param("recruiterId") UUID recruiterId,
            Pageable pageable);

    Optional<Application> findByIdAndCandidateUserId(UUID id, UUID userId);

    @Query("SELECT a FROM Application a WHERE a.id = :id AND a.jobOffer.recruiter.user.id = :recruiterId")
    Optional<Application> findByIdAndRecruiterUserId(@Param("id") UUID id, @Param("recruiterId") UUID recruiterId);
}
