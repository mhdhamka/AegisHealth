package com.aegishealth.biometrics.controller;

import com.aegishealth.biometrics.dto.CreateHealthLogRequest;
import com.aegishealth.biometrics.entity.HealthLog;
import com.aegishealth.biometrics.repository.HealthLogRepository;
import com.aegishealth.biometrics.service.BiometricsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/health-logs")
public class HealthLogController {

    private final BiometricsService biometricsService;
    private final HealthLogRepository healthLogRepository;

    public HealthLogController(BiometricsService biometricsService, HealthLogRepository healthLogRepository) {
        this.biometricsService = biometricsService;
        this.healthLogRepository = healthLogRepository;
    }

    @GetMapping
    public ResponseEntity<List<HealthLog>> getAllLogs(
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_elena_894") String userId,
            @RequestParam(required = false) String category) {
        if (category != null && !category.equalsIgnoreCase("all")) {
            return ResponseEntity.ok(healthLogRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category));
        }
        return ResponseEntity.ok(healthLogRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping
    public ResponseEntity<HealthLog> createLog(
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_elena_894") String userId,
            @Valid @RequestBody CreateHealthLogRequest request) {
        HealthLog created = biometricsService.recordBiomarkerLog(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        healthLogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
