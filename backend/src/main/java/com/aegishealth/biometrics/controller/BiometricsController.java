package com.aegishealth.biometrics.controller;

import com.aegishealth.biometrics.dto.BiometricPointDto;
import com.aegishealth.biometrics.dto.BiometricsSummaryResponse;
import com.aegishealth.biometrics.service.BiometricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Spring Boot REST Controller for Real-Time & Longitudinal Biometrics
 * Consumed directly by Next.js / React frontend clients.
 */
@RestController
@RequestMapping("/api/v1/biometrics")
public class BiometricsController {

    private final BiometricsService biometricsService;

    public BiometricsController(BiometricsService biometricsService) {
        this.biometricsService = biometricsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<BiometricsSummaryResponse> getSummary(
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_elena_894") String userId) {
        return ResponseEntity.ok(biometricsService.computeDailySummary(userId));
    }

    @GetMapping("/timeseries")
    public ResponseEntity<List<BiometricPointDto>> getTimeSeries(
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_elena_894") String userId,
            @RequestParam(defaultValue = "24h") String range) {
        return ResponseEntity.ok(biometricsService.getTimeSeriesData(userId, range));
    }
}
