package com.hotel.common.lock;

import com.hotel.common.exception.ConflictException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RedisLockServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private RedisLockService redisLockService;

    @Test
    @DisplayName("Debe adquirir y liberar el lock exitosamente al ejecutar la tarea")
    void executeWithLock_WhenLockAcquired_ShouldExecuteTaskAndRelease() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq("lock:room:1:2026-09-10_2026-09-12"), eq("LOCKED"), any(Duration.class)))
                .thenReturn(true);

        String result = redisLockService.executeWithLock(
                "lock:room:1:2026-09-10_2026-09-12",
                Duration.ofSeconds(10),
                () -> "RESERVA_EXITOSA"
        );

        assertEquals("RESERVA_EXITOSA", result);
        verify(redisTemplate, times(1)).delete("lock:room:1:2026-09-10_2026-09-12");
    }

    @Test
    @DisplayName("Debe lanzar ConflictException si el lock ya está tomado por otra petición concurrente")
    void executeWithLock_WhenLockAlreadyTaken_ShouldThrowConflictException() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq("lock:room:1:2026-09-10_2026-09-12"), eq("LOCKED"), any(Duration.class)))
                .thenReturn(false);

        assertThrows(ConflictException.class, () ->
                redisLockService.executeWithLock(
                        "lock:room:1:2026-09-10_2026-09-12",
                        Duration.ofSeconds(10),
                        () -> "RESERVA_FALLIDA"
                )
        );

        verify(redisTemplate, never()).delete(anyString());
    }
}
