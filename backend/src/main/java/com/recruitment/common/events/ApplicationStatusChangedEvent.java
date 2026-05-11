package com.recruitment.common.events;

import com.recruitment.common.enums.ApplicationStatus;
import java.util.UUID;

public record ApplicationStatusChangedEvent(
        UUID applicationId,
        UUID recruiterProfileId,
        ApplicationStatus previousStatus,
        ApplicationStatus newStatus
) {}
