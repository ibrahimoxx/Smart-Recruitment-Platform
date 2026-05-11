package com.recruitment.common.events;

import java.util.UUID;

public record ApplicationSubmittedEvent(UUID applicationId, UUID candidateProfileId, UUID jobOfferId) {}
