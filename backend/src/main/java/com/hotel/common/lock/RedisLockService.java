package com.hotel.common.lock;

import com.hotel.common.exception.ConflictException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisLockService {

    private final StringRedisTemplate redisTemplate;

    /**
     * Intenta adquirir un lock distribuido para una clave con TTL determinado.
     *
     * @param lockKey Clave del lock en Redis
     * @param ttl     Tiempo de vida del candado (evita deadlocks)
     * @return true si se adquirió con éxito, false si ya estaba bloqueado
     */
    public boolean acquireLock(String lockKey, Duration ttl) {
        try {
            Boolean success = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", ttl);
            boolean acquired = Boolean.TRUE.equals(success);
            if (acquired) {
                log.debug("Lock distribuido adquirido con éxito: {}", lockKey);
            } else {
                log.warn("No se pudo adquirir el lock distribuido, ya está ocupado: {}", lockKey);
            }
            return acquired;
        } catch (Exception e) {
            log.warn("Redis no disponible para adquirir lock [{}]. Continuando con validación JPA: {}", lockKey, e.getMessage());
            return true; // Fallback tolerante a fallos si Redis no está activo en entorno de desarrollo
        }
    }

    /**
     * Libera el lock distribuido.
     *
     * @param lockKey Clave del lock en Redis
     */
    public void releaseLock(String lockKey) {
        try {
            redisTemplate.delete(lockKey);
            log.debug("Lock distribuido liberado: {}", lockKey);
        } catch (Exception e) {
            log.warn("Error al liberar lock [{}]: {}", lockKey, e.getMessage());
        }
    }

    /**
     * Ejecuta una tarea protegida bajo un lock distribuido.
     * Si no se adquiere el lock, lanza ConflictException (409 Conflict).
     */
    public <T> T executeWithLock(String lockKey, Duration ttl, Supplier<T> task) {
        boolean acquired = acquireLock(lockKey, ttl);
        if (!acquired) {
            throw new ConflictException("La habitación solicitada está siendo procesada en este momento. Intente nuevamente en unos segundos.");
        }

        try {
            return task.get();
        } finally {
            releaseLock(lockKey);
        }
    }
}
