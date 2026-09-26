package com.aegishealth.biometrics.controller;

import com.aegishealth.biometrics.entity.WearableDevice;
import com.aegishealth.biometrics.service.WearableSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wearables")
public class WearableSyncController {

    private final WearableSyncService wearableSyncService;

    public WearableSyncController(WearableSyncService wearableSyncService) {
        this.wearableSyncService = wearableSyncService;
    }

    @GetMapping
    public ResponseEntity<List<WearableDevice>> getDevices(
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_elena_894") String userId) {
        return ResponseEntity.ok(wearableSyncService.getUserDevices(userId));
    }

    @PostMapping("/sync/{deviceId}")
    public ResponseEntity<WearableDevice> syncDevice(
            @PathVariable String deviceId,
            @RequestBody(required = false) Map<String, Object> payload) {
        int samples = payload != null && payload.containsKey("samples") 
                ? (int) payload.get("samples") 
                : 340;
        return ResponseEntity.ok(wearableSyncService.ingestDeviceBatch(deviceId, samples));
    }
}
