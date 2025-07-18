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

    public ExpenseService(ExpenseRepository expenseRepository, GroupRepository groupRepository, UserRepository userRepository, SplitRepository splitRepository) {
        this.expenseRepository = expenseRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.splitRepository = splitRepository;
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
        int memberCount = group.getMembers().size();
        BigDecimal splitAmount = amount.divide(BigDecimal.valueOf(memberCount), BigDecimal.ROUND_HALF_UP);
        Set<Split> splits = new HashSet<>();
        for (User member : group.getMembers()) {
            Split split = Split.builder()
                    .user(member)
                    .amount(splitAmount)
                    .build();
            splits.add(splitRepository.save(split));
        }
        Expense expense = Expense.builder()
                .group(group)
                .paidBy(paidBy)
                .amount(amount)
                .description(description)
                .splits(splits)
                .build();
        return expenseRepository.save(expense);
    }
} 