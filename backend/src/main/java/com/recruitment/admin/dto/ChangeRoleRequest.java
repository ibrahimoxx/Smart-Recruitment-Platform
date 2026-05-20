package com.recruitment.admin.dto;

import com.recruitment.common.enums.Role;
import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(@NotNull Role role) {}
