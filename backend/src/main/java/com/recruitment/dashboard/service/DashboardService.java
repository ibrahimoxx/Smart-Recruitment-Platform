package com.recruitment.dashboard.service;

import com.recruitment.ai.repository.MatchScoreRepository;
import com.recruitment.applications.repository.ApplicationRepository;
import com.recruitment.auth.repository.UserRepository;
import com.recruitment.common.enums.ApplicationStatus;
import com.recruitment.common.enums.JobOfferStatus;
import com.recruitment.common.enums.Role;
import com.recruitment.dashboard.dto.AdminDashboardResponse;
import com.recruitment.dashboard.dto.RecruiterDashboardResponse;
import com.recruitment.jobs.repository.JobOfferRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final MatchScoreRepository matchScoreRepository;

    public AdminDashboardResponse getAdminDashboard() {
        long totalUsers = userRepository.count();
        long candidateCount = userRepository.countByRole(Role.CANDIDATE);
        long recruiterCount = userRepository.countByRole(Role.RECRUITER);
        long totalJobOffers = jobOfferRepository.count();
        Map<JobOfferStatus, Long> jobsByStatus = toEnumMap(jobOfferRepository.countByStatus(), JobOfferStatus.class);
        long totalApplications = applicationRepository.count();
        Map<ApplicationStatus, Long> applicationsByStatus =
                toEnumMap(applicationRepository.countByStatus(), ApplicationStatus.class);
        long newApplicationsLast7Days =
                applicationRepository.countByAppliedAtAfter(Instant.now().minus(7, ChronoUnit.DAYS));
        double avgMatchScore = defaultDouble(matchScoreRepository.avgScore());

        return new AdminDashboardResponse(
                totalUsers,
                candidateCount,
                recruiterCount,
                totalJobOffers,
                jobsByStatus,
                totalApplications,
                applicationsByStatus,
                newApplicationsLast7Days,
                avgMatchScore
        );
    }

    public RecruiterDashboardResponse getRecruiterDashboard(UUID recruiterUserId) {
        long myJobsTotal = jobOfferRepository.countByRecruiterUserId(recruiterUserId);
        Map<JobOfferStatus, Long> myJobsByStatus =
                toEnumMap(jobOfferRepository.countByStatusForRecruiter(recruiterUserId), JobOfferStatus.class);
        long myApplicationsTotal = applicationRepository.countByRecruiterUserId(recruiterUserId);
        Map<ApplicationStatus, Long> myApplicationsByStatus =
                toEnumMap(applicationRepository.countByStatusForRecruiter(recruiterUserId), ApplicationStatus.class);
        double avgMatchScore = defaultDouble(matchScoreRepository.avgScoreForRecruiter(recruiterUserId));

        return RecruiterDashboardResponse.of(
                myJobsTotal,
                myJobsByStatus,
                myApplicationsTotal,
                myApplicationsByStatus,
                avgMatchScore,
                applicationRepository.findTopJobsByApplicationCountForRecruiter(
                        recruiterUserId,
                        PageRequest.of(0, 5)
                )
        );
    }

    private static double defaultDouble(Double value) {
        return value != null ? value : 0.0;
    }

    private static <E extends Enum<E>> Map<E, Long> toEnumMap(List<Object[]> rows, Class<E> enumType) {
        EnumMap<E, Long> counts = new EnumMap<>(enumType);
        for (E constant : enumType.getEnumConstants()) {
            counts.put(constant, 0L);
        }
        for (Object[] row : rows) {
            counts.put(enumType.cast(row[0]), ((Number) row[1]).longValue());
        }
        return counts;
    }
}
