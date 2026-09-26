package com.aegishealth.biometrics.repository;

import com.aegishealth.biometrics.entity.WearableDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WearableDeviceRepository extends JpaRepository<WearableDevice, String> {

    List<WearableDevice> findByUserId(String userId);
}
