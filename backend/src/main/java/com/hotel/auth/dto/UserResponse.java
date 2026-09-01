package com.hotel.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private List<String> roles;
    private GuestDto guestProfile;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestDto {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String documentType;
        private String documentNumber;
    }
}
