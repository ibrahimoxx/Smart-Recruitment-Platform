package com.recruitment.users.entity;

import com.recruitment.auth.entity.User;
import com.recruitment.common.BaseEntity;
import com.recruitment.common.enums.ExperienceLevel;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "candidate_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CandidateProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 255)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(length = 255)
    private String location;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 32)
    private ExperienceLevel experienceLevel;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "linkedin_url", length = 512)
    private String linkedinUrl;

    @Column(name = "github_url", length = 512)
    private String githubUrl;

    @Column(name = "portfolio_url", length = 512)
    private String portfolioUrl;

    @Column(name = "cv_object_key", length = 512)
    private String cvObjectKey;

    @Column(name = "cv_original_filename", length = 255)
    private String cvOriginalFilename;

    @Column(name = "cv_uploaded_at")
    private Instant cvUploadedAt;

    public static CandidateProfile create(User user) {
        CandidateProfile p = new CandidateProfile();
        p.user = user;
        return p;
    }

    public void update(String headline, String summary, String location,
                       Integer yearsOfExperience, ExperienceLevel experienceLevel,
                       String skills, String linkedinUrl, String githubUrl, String portfolioUrl) {
        this.headline = headline;
        this.summary = summary;
        this.location = location;
        this.yearsOfExperience = yearsOfExperience;
        this.experienceLevel = experienceLevel;
        this.skills = skills;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
        this.portfolioUrl = portfolioUrl;
    }

    public void updateCv(String cvObjectKey, String cvOriginalFilename) {
        this.cvObjectKey = cvObjectKey;
        this.cvOriginalFilename = cvOriginalFilename;
        this.cvUploadedAt = Instant.now();
    }
}
