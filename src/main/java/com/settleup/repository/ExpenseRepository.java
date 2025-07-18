package com.settleup.repository;

import com.settleup.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    // You can add custom query methods here if needed
} 