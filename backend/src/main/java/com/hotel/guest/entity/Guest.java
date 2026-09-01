package com.hotel.guest.entity;

import com.hotel.common.audit.Auditable;
import com.hotel.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "guests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(name = "document_type", nullable = false, length = 20)
    @Builder.Default
    private String documentType = "CC";

    @Column(name = "document_number", nullable = false, length = 50)
    private String documentNumber;
}
