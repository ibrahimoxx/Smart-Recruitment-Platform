package com.recruitment.jobs.repository;

import com.recruitment.jobs.entity.JobOffer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JobOfferRepository extends JpaRepository<JobOffer, UUID>, JpaSpecificationExecutor<JobOffer> {
    List<JobOffer> findByRecruiterId(UUID recruiterId);
    boolean existsByIdAndRecruiterId(UUID id, UUID recruiterId);
}
