package com.hotel.room.dto;

import com.hotel.room.entity.RoomOperationalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoomStatusRequest {

    @NotNull(message = "El nuevo estado operativo es obligatorio")
    private RoomOperationalStatus status;
}
