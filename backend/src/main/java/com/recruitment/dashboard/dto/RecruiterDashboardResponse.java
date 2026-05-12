package com.recruitment.dashboard.dto;

import com.recruitment.common.enums.ApplicationStatus;
import com.recruitment.common.enums.JobOfferStatus;
import java.util.List;
import java.util.Map;

public record RecruiterDashboardResponse(
        long myJobsTotal,
        Map<JobOfferStatus, Long> myJobsByStatus,
        long myApplicationsTotal,
        Map<ApplicationStatus, Long> myApplicationsByStatus,
        double avgMatchScore,
        List<JobApplicationCount> topJobsByApplicationCount
) {
    public static RecruiterDashboardResponse of(
            long myJobsTotal,
            Map<JobOfferStatus, Long> myJobsByStatus,
            long myApplicationsTotal,
            Map<ApplicationStatus, Long> myApplicationsByStatus,
            double avgMatchScore,
            List<Object[]> topJobsByApplicationCount
    ) {
        List<JobApplicationCount> topJobs = topJobsByApplicationCount.stream()
                .map(row -> new JobApplicationCount((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        return new RecruiterDashboardResponse(
                myJobsTotal,
                myJobsByStatus,
                myApplicationsTotal,
                myApplicationsByStatus,
                avgMatchScore,
                topJobs
        );
    }
}

record JobApplicationCount(String jobTitle, long applicationCount) {
}
