package com.hotel.user.dto;

import com.hotel.auth.dto.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponse {
    private Long id;
    private String email;
    private boolean active;
    private List<String> roles;
    private UserResponse.GuestDto profile;
    private LocalDateTime createdAt;
}
