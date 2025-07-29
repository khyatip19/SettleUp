package com.settleup.controller;

import com.settleup.model.*;
import com.settleup.repository.*;
import com.settleup.service.SplitService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final SplitService splitService;

    public TestController(UserRepository userRepository, 
                         GroupRepository groupRepository, 
                         ExpenseRepository expenseRepository,
                         SplitService splitService) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
        this.splitService = splitService;
    }

    @GetMapping("/data-summary")
    public ResponseEntity<Map<String, Object>> getDataSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalUsers", userRepository.count());
        summary.put("totalGroups", groupRepository.count());
        summary.put("totalExpenses", expenseRepository.count());
        
        // Get all users
        List<User> users = userRepository.findAll();
        summary.put("users", users);
        
        // Get all groups
        List<Group> groups = groupRepository.findAll();
        summary.put("groups", groups);
        
        // Get all expenses
        List<Expense> expenses = expenseRepository.findAll();
        summary.put("expenses", expenses);
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/user-balances")
    public ResponseEntity<Map<String, Object>> getUserBalances() {
        Map<String, Object> balances = new HashMap<>();
        List<User> users = userRepository.findAll();
        List<Group> groups = groupRepository.findAll();
        
        for (User user : users) {
            Map<String, Object> userBalance = new HashMap<>();
            userBalance.put("userId", user.getId());
            userBalance.put("userName", user.getName());
            userBalance.put("totalOwed", splitService.getTotalOwedByUser(user.getId()));
            
            Map<String, BigDecimal> groupBalances = new HashMap<>();
            for (Group group : groups) {
                if (group.getMembers().contains(user)) {
                    BigDecimal balance = splitService.getUserBalanceInGroup(user.getId(), group.getId());
                    groupBalances.put(group.getName(), balance);
                }
            }
            userBalance.put("groupBalances", groupBalances);
            balances.put(user.getName(), userBalance);
        }
        
        return ResponseEntity.ok(balances);
    }

    @GetMapping("/group/{groupId}/splits")
    public ResponseEntity<Map<String, Object>> getGroupSplits(@PathVariable Long groupId) {
        Map<String, Object> result = new HashMap<>();
        
        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null) {
            return ResponseEntity.notFound().build();
        }
        
        result.put("groupName", group.getName());
        result.put("members", group.getMembers());
        
        List<Expense> groupExpenses = expenseRepository.findAll().stream()
                .filter(expense -> expense.getGroup().getId().equals(groupId))
                .toList();
        
        result.put("expenses", groupExpenses);
        result.put("pendingSplits", splitService.getPendingSplitsByGroup(groupId));
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/test-split-creation")
    public ResponseEntity<Map<String, Object>> testSplitCreation() {
        Map<String, Object> result = new HashMap<>();
        
        // Get the first group and create a test expense
        Group firstGroup = groupRepository.findAll().get(0);
        User firstUser = userRepository.findAll().get(0);
        
        Expense testExpense = Expense.builder()
                .group(firstGroup)
                .paidBy(firstUser)
                .amount(new BigDecimal("100.00"))
                .description("Test Expense")
                .splits(new java.util.HashSet<>())
                .build();
        
        testExpense = expenseRepository.save(testExpense);
        
        // Create splits
        var splits = splitService.createEqualSplits(testExpense, firstGroup.getMembers());
        testExpense.setSplits(splits);
        expenseRepository.save(testExpense);
        
        result.put("message", "Test expense created successfully");
        result.put("expenseId", testExpense.getId());
        result.put("splitsCreated", splits.size());
        result.put("splits", splits);
        
        return ResponseEntity.ok(result);
    }
} 