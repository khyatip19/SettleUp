package com.settleup.service;

import com.settleup.model.*;
import com.settleup.repository.SplitRepository;
import com.settleup.repository.ExpenseRepository;
import com.settleup.repository.UserRepository;
import com.settleup.repository.GroupRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class SplitService {
    private final SplitRepository splitRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;

    public SplitService(SplitRepository splitRepository, 
                       ExpenseRepository expenseRepository,
                       UserRepository userRepository,
                       GroupRepository groupRepository) {
        this.splitRepository = splitRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
    }

    // Create splits for an expense with equal distribution
    public Set<Split> createEqualSplits(Expense expense, Set<User> members) {
        BigDecimal splitAmount = expense.getAmount()
                .divide(BigDecimal.valueOf(members.size()), BigDecimal.ROUND_HALF_UP);
        
        return members.stream()
                .map(member -> Split.builder()
                        .expense(expense)
                        .user(member)
                        .amount(splitAmount)
                        .splitType(Split.SplitType.EQUAL)
                        .status(Split.SplitStatus.PENDING)
                        .build())
                .map(splitRepository::save)
                .collect(Collectors.toSet());
    }

    // Create splits with custom amounts
    public Set<Split> createCustomSplits(Expense expense, Set<User> members, 
                                       java.util.Map<Long, BigDecimal> userAmounts) {
        return members.stream()
                .map(member -> {
                    BigDecimal amount = userAmounts.getOrDefault(member.getId(), BigDecimal.ZERO);
                    return Split.builder()
                            .expense(expense)
                            .user(member)
                            .amount(amount)
                            .splitType(Split.SplitType.CUSTOM)
                            .status(Split.SplitStatus.PENDING)
                            .build();
                })
                .map(splitRepository::save)
                .collect(Collectors.toSet());
    }

    // Mark a split as paid
    public Split markSplitAsPaid(Long splitId) {
        Split split = splitRepository.findById(splitId)
                .orElseThrow(() -> new RuntimeException("Split not found"));
        split.setStatus(Split.SplitStatus.PAID);
        return splitRepository.save(split);
    }

    // Mark a split as settled
    public Split markSplitAsSettled(Long splitId) {
        Split split = splitRepository.findById(splitId)
                .orElseThrow(() -> new RuntimeException("Split not found"));
        split.setStatus(Split.SplitStatus.SETTLED);
        return splitRepository.save(split);
    }

    // Get all splits for a user
    public List<Split> getSplitsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return splitRepository.findByUser(user);
    }

    // Get all splits for an expense
    public List<Split> getSplitsByExpense(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return splitRepository.findByExpense(expense);
    }

    // Get user's balance in a group
    public BigDecimal getUserBalanceInGroup(Long userId, Long groupId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        BigDecimal totalOwed = splitRepository.getTotalOwedByUserInGroup(user, group);
        BigDecimal totalPaid = splitRepository.getTotalPaidByUserInGroup(user, group);
        
        return totalOwed.subtract(totalPaid);
    }

    // Get all pending splits for a group
    public List<Split> getPendingSplitsByGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return splitRepository.findPendingSplitsByGroup(group);
    }

    // Update split amount
    public Split updateSplitAmount(Long splitId, BigDecimal newAmount) {
        Split split = splitRepository.findById(splitId)
                .orElseThrow(() -> new RuntimeException("Split not found"));
        split.setAmount(newAmount);
        return splitRepository.save(split);
    }

    // Delete a split
    public void deleteSplit(Long splitId) {
        splitRepository.deleteById(splitId);
    }

    // Get split by user and expense
    public Optional<Split> getSplitByUserAndExpense(Long userId, Long expenseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return splitRepository.findByUserAndExpense(user, expense);
    }

    // Get total amount owed by a user across all groups
    public BigDecimal getTotalOwedByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Split> pendingSplits = splitRepository.findByUserAndStatus(user, Split.SplitStatus.PENDING);
        return pendingSplits.stream()
                .map(Split::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
} 