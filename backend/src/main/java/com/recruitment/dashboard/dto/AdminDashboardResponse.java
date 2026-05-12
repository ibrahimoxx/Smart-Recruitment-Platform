package com.recruitment.dashboard.dto;

import com.recruitment.common.enums.ApplicationStatus;
import com.recruitment.common.enums.JobOfferStatus;
import java.util.Map;

public record AdminDashboardResponse(
        long totalUsers,
        long candidateCount,
        long recruiterCount,
        long totalJobOffers,
        Map<JobOfferStatus, Long> jobsByStatus,
        long totalApplications,
        Map<ApplicationStatus, Long> applicationsByStatus,
        long newApplicationsLast7Days,
        double avgMatchScore
) {
}
