package com.settleup.repository;

import com.settleup.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SplitRepository extends JpaRepository<Split, Long> {
    
    // Find all splits for a specific user
    List<Split> findByUser(User user);
    
    // Find all splits for a specific expense
    List<Split> findByExpense(Expense expense);
    
    // Find all splits for a user in a specific group
    @Query("SELECT s FROM Split s WHERE s.user = :user AND s.expense.group = :group")
    List<Split> findByUserAndGroup(@Param("user") User user, @Param("group") Group group);
    
    // Find all splits for a specific expense with a given status
    List<Split> findByExpenseAndStatus(Expense expense, Split.SplitStatus status);
    
    // Find all splits for a user with a given status
    List<Split> findByUserAndStatus(User user, Split.SplitStatus status);
    
    // Find a specific split for a user in an expense
    Optional<Split> findByUserAndExpense(User user, Expense expense);
    
    // Calculate total amount owed by a user in a group
    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Split s WHERE s.user = :user AND s.expense.group = :group AND s.status = 'PENDING'")
    BigDecimal getTotalOwedByUserInGroup(@Param("user") User user, @Param("group") Group group);
    
    // Calculate total amount paid by a user in a group
    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Split s WHERE s.user = :user AND s.expense.group = :group AND s.status = 'PAID'")
    BigDecimal getTotalPaidByUserInGroup(@Param("user") User user, @Param("group") Group group);
    
    // Find all pending splits for a group
    @Query("SELECT s FROM Split s WHERE s.expense.group = :group AND s.status = 'PENDING'")
    List<Split> findPendingSplitsByGroup(@Param("group") Group group);
    
    // Count pending splits for a user
    long countByUserAndStatus(User user, Split.SplitStatus status);
    
    // Find splits by split type
    List<Split> findBySplitType(Split.SplitType splitType);
    
    // Find splits by expense and split type
    List<Split> findByExpenseAndSplitType(Expense expense, Split.SplitType splitType);
} 