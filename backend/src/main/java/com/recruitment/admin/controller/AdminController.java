package com.recruitment.admin.controller;

import com.recruitment.admin.dto.ChangeRoleRequest;
import com.recruitment.admin.dto.UserResponse;
import com.recruitment.auth.entity.User;
import com.recruitment.auth.repository.UserRepository;
import com.recruitment.common.ApiResponse;
import com.recruitment.common.PagedResponse;
import com.recruitment.common.exception.AppException;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.lang.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> listUsers(
            @PageableDefault(size = 50) @NonNull Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.of(userRepository.findAll(pageable).map(UserResponse::from))
        ));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> changeRole(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        user.changeRole(request.role());
        return ResponseEntity.ok(ApiResponse.success(UserResponse.from(userRepository.save(user))));
    }
}
