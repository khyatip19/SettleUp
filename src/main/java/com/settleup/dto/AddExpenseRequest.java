package com.settleup.dto;

import com.settleup.model.Split;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AddExpenseRequest {
    private Long groupId;
    private Long paidById;
    private BigDecimal amount;
    private String description;
    private Split.SplitType splitType;
    private List<SplitDetail> splits;

    @Data
    public static class SplitDetail {
        private Long userId;
        private BigDecimal amount;      // Used for CUSTOM or EQUAL
        private Double percentage;      // Used for PERCENTAGE
    }
} 