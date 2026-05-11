package com.recruitment.users.dto;

import com.recruitment.common.enums.ExperienceLevel;

public record CandidateProfileRequest(
        String headline,
        String summary,
        String location,
        Integer yearsOfExperience,
        ExperienceLevel experienceLevel,
        String skills,
        String linkedinUrl,
        String githubUrl,
        String portfolioUrl
) {}
