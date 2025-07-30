package com.settleup.service;

import com.settleup.model.*;
import com.settleup.repository.*;
import com.settleup.dto.AddExpenseRequest;

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

    public Expense addExpense(AddExpenseRequest request) {
        Group group = groupRepository.findById(request.getGroupId()).orElseThrow();
        User paidBy = userRepository.findById(request.getPaidById()).orElseThrow();

        // Create the expense first
        Expense expense = Expense.builder()
                .group(group)
                .paidBy(paidBy)
                .amount(request.getAmount())
                .description(request.getDescription())
                .splits(new HashSet<>())
                .build();
        expense = expenseRepository.save(expense);

        Set<Split> splits = new HashSet<>();
        if (request.getSplitType() == Split.SplitType.EQUAL) {
            // Equal split among all provided users
            List<AddExpenseRequest.SplitDetail> splitDetails = request.getSplits();
            int n = splitDetails.size();
            BigDecimal total = request.getAmount();
            BigDecimal equalAmount = total.divide(BigDecimal.valueOf(n), 2, BigDecimal.ROUND_HALF_UP);
            for (AddExpenseRequest.SplitDetail detail : splitDetails) {
                User user = userRepository.findById(detail.getUserId()).orElseThrow();
                Split split = Split.builder()
                        .expense(expense)
                        .user(user)
                        .amount(equalAmount)
                        .splitType(Split.SplitType.EQUAL)
                        .status(Split.SplitStatus.PENDING)
                        .build();
                splits.add(splitRepository.save(split));
            }
        } else if (request.getSplitType() == Split.SplitType.PERCENTAGE) {
            // Split based on percentage
            for (AddExpenseRequest.SplitDetail detail : request.getSplits()) {
                User user = userRepository.findById(detail.getUserId()).orElseThrow();
                BigDecimal userAmount = request.getAmount().multiply(BigDecimal.valueOf(detail.getPercentage() / 100.0));
                userAmount = userAmount.setScale(2, BigDecimal.ROUND_HALF_UP);
                Split split = Split.builder()
                        .expense(expense)
                        .user(user)
                        .amount(userAmount)
                        .splitType(Split.SplitType.PERCENTAGE)
                        .status(Split.SplitStatus.PENDING)
                        .build();
                splits.add(splitRepository.save(split));
            }
        } else if (request.getSplitType() == Split.SplitType.CUSTOM) {
            // Custom amount for each user
            for (AddExpenseRequest.SplitDetail detail : request.getSplits()) {
                User user = userRepository.findById(detail.getUserId()).orElseThrow();
                Split split = Split.builder()
                        .expense(expense)
                        .user(user)
                        .amount(detail.getAmount().setScale(2, BigDecimal.ROUND_HALF_UP))
                        .splitType(Split.SplitType.CUSTOM)
                        .status(Split.SplitStatus.PENDING)
                        .build();
                splits.add(splitRepository.save(split));
            }
        } else {
            throw new IllegalArgumentException("Unsupported split type");
        }

        expense.setSplits(splits);
        return expenseRepository.save(expense);
    }
} 