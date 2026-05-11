package com.recruitment.users.service;

import com.recruitment.common.PagedResponse;
import com.recruitment.common.exception.AppException;
import com.recruitment.users.dto.CompanyRequest;
import com.recruitment.users.dto.CompanyResponse;
import com.recruitment.users.entity.Company;
import com.recruitment.users.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;

    public PagedResponse<CompanyResponse> listCompanies(Pageable pageable) {
        return PagedResponse.of(companyRepository.findAll(pageable).map(CompanyResponse::from));
    }

    public CompanyResponse getById(UUID id) {
        return CompanyResponse.from(findOrThrow(id));
    }

    public CompanyResponse create(CompanyRequest request) {
        if (companyRepository.existsBySlug(request.slug())) {
            throw new AppException(HttpStatus.CONFLICT, "Company slug already exists");
        }
        Company company = Company.create(
                request.name(), request.slug(), request.description(),
                request.websiteUrl(), request.industry(),
                request.companySize(), request.headquarters()
        );
        return CompanyResponse.from(companyRepository.save(company));
    }

    public CompanyResponse update(UUID id, CompanyRequest request) {
        Company company = findOrThrow(id);
        company.update(request.name(), request.description(), request.websiteUrl(),
                request.industry(), request.companySize(), request.headquarters());
        return CompanyResponse.from(companyRepository.save(company));
    }

    private Company findOrThrow(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Company not found"));
    }
}
