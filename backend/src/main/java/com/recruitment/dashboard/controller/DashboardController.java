package com.recruitment.dashboard.controller;

import com.recruitment.auth.entity.User;
import com.recruitment.common.ApiResponse;
import com.recruitment.dashboard.dto.AdminDashboardResponse;
import com.recruitment.dashboard.dto.RecruiterDashboardResponse;
import com.recruitment.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Dashboard data retrieved",
                dashboardService.getAdminDashboard()
        ));
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<RecruiterDashboardResponse>> getRecruiterDashboard(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(
                "Dashboard data retrieved",
                dashboardService.getRecruiterDashboard(user.getId())
        ));
    }
}
