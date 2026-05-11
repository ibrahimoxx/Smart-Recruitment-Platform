package com.recruitment.users.service;

import com.recruitment.auth.entity.User;
import com.recruitment.common.exception.AppException;
import com.recruitment.users.dto.RecruiterProfileRequest;
import com.recruitment.users.dto.RecruiterProfileResponse;
import com.recruitment.users.entity.Company;
import com.recruitment.users.entity.RecruiterProfile;
import com.recruitment.users.repository.CompanyRepository;
import com.recruitment.users.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RecruiterProfileService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;

    public RecruiterProfileResponse getMyProfile(User user) {
        RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Recruiter profile not found"));
        return RecruiterProfileResponse.from(profile);
    }

    public RecruiterProfileResponse upsertMyProfile(User user, RecruiterProfileRequest request) {
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Company not found"));

        RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId())
                .map(p -> {
                    p.update(company, request.jobTitle(), request.department(), request.bio());
                    return p;
                })
                .orElseGet(() -> RecruiterProfile.create(user, company,
                        request.jobTitle(), request.department(), request.bio()));

        return RecruiterProfileResponse.from(recruiterProfileRepository.save(profile));
    }
}
