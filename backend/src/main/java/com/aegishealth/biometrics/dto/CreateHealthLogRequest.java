package com.aegishealth.biometrics.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHealthLogRequest {

    @NotBlank(message = "Category cannot be blank")
    private String category;

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Metric name cannot be blank")
    private String metric;

    @NotBlank(message = "Value cannot be blank")
    private String value;

    private String unit;
    private String referenceRange;
    private String status;
    private String source;
    private String notes;
}
