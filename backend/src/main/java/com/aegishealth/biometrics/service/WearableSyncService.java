package com.aegishealth.biometrics.service;

import com.aegishealth.biometrics.entity.WearableDevice;
import com.aegishealth.biometrics.repository.WearableDeviceRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class WearableSyncService {

    private final WearableDeviceRepository wearableRepo;

    public WearableSyncService(WearableDeviceRepository wearableRepo) {
        this.wearableRepo = wearableRepo;
    }

    public List<WearableDevice> getUserDevices(String userId) {
        return wearableRepo.findByUserId(userId);
    }

    @Transactional
    @CacheEvict(value = {"biometrics_summary", "biometrics_timeseries"}, allEntries = true)
    public WearableDevice ingestDeviceBatch(String deviceId, int sampleCount) {
        WearableDevice device = wearableRepo.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Wearable hardware device not found: " + deviceId));

        device.setLastSyncTimestamp(Instant.now());
        device.setTotalRecordsSynced(device.getTotalRecordsSynced() + sampleCount);
        device.setStatus("connected");
        return wearableRepo.save(device);
    }
}
