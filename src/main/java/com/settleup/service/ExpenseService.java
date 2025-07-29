package com.settleup.service;

import com.settleup.model.*;
import com.settleup.repository.*;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final SplitRepository splitRepository;
    private final SplitService splitService;

    public ExpenseService(ExpenseRepository expenseRepository, GroupRepository groupRepository, UserRepository userRepository, SplitRepository splitRepository, SplitService splitService) {
        this.expenseRepository = expenseRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.splitRepository = splitRepository;
        this.splitService = splitService;
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }

    public Expense createExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    // Add an expense and split equally among group members
    public Expense addExpense(Long groupId, Long paidById, BigDecimal amount, String description) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        User paidBy = userRepository.findById(paidById).orElseThrow();
        
        // Create the expense first
        Expense expense = Expense.builder()
                .group(group)
                .paidBy(paidBy)
                .amount(amount)
                .description(description)
                .splits(new HashSet<>())
                .build();
        
        expense = expenseRepository.save(expense);
        
        // Create splits using SplitService
        Set<Split> splits = splitService.createEqualSplits(expense, group.getMembers());
        expense.setSplits(splits);
        
        return expenseRepository.save(expense);
    }
} 