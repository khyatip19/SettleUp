package com.settleup.repository;

import com.settleup.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SplitRepository extends JpaRepository<Split, Long> {
    // You can add custom query methods here if needed
} 