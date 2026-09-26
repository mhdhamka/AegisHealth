package com.aegishealth.biometrics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * AegisHealth Modern Full-Stack Biometrics Platform - Backend Entry Point
 * 
 * Replaces the legacy Java desktop (Swing / JFreeChart) monolithic application
 * with a high-performance, cloud-native Spring Boot 3 REST API server.
 */
@SpringBootApplication
@EnableCaching
@EnableScheduling
public class AegisHealthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AegisHealthApplication.class, args);
    }
}
