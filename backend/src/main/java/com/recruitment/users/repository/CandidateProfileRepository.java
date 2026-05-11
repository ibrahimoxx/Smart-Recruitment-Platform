package com.recruitment.users.repository;

import com.recruitment.users.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, UUID> {
    Optional<CandidateProfile> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}
