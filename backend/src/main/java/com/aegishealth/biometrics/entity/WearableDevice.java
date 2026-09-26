package com.aegishealth.biometrics.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Synchronized wearable hardware device registered in cloud backend.
 */
@Entity
@Table(name = "wearable_devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WearableDevice {

    @Id
    @Column(length = 64)
    private String deviceId;

    @Column(nullable = false, length = 64)
    private String userId;

    @Column(nullable = false, length = 64)
    private String name;

    @Column(nullable = false, length = 32)
    private String brand; // Apple, Garmin, Whoop, Oura, Fitbit

    @Column(length = 64)
    private String model;

    @Column(length = 32)
    private String status; // connected, syncing, idle, error

    private Integer batteryPercent;

    private Instant lastSyncTimestamp;

    private Integer autoSyncIntervalMinutes;

    private Long totalRecordsSynced;

    @Column(length = 32)
    private String firmwareVersion;
}
