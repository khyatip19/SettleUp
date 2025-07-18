package com.settleup.repository;

import com.settleup.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
    // You can add custom query methods here if needed
} 