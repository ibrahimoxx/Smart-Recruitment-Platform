package com.recruitment.users.controller;

import com.recruitment.common.ApiResponse;
import com.recruitment.common.PagedResponse;
import com.recruitment.users.dto.CompanyRequest;
import com.recruitment.users.dto.CompanyResponse;
import com.recruitment.users.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> listCompanies(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(companyService.listCompanies(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(
            @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company created", companyService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable UUID id, @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(companyService.update(id, request)));
    }
}
