package com.settleup.controller;

import com.settleup.model.Split;
import com.settleup.service.SplitService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/splits")
public class SplitController {
    private final SplitService splitService;

    public SplitController(SplitService splitService) {
        this.splitService = splitService;
    }

    // Get all splits for a user
    @GetMapping("/user/{userId}")
    public List<Split> getSplitsByUser(@PathVariable Long userId) {
        return splitService.getSplitsByUser(userId);
    }

    // Get all splits for an expense
    @GetMapping("/expense/{expenseId}")
    public List<Split> getSplitsByExpense(@PathVariable Long expenseId) {
        return splitService.getSplitsByExpense(expenseId);
    }

    // Get user's balance in a group
    @GetMapping("/balance/user/{userId}/group/{groupId}")
    public ResponseEntity<Map<String, Object>> getUserBalanceInGroup(
            @PathVariable Long userId, 
            @PathVariable Long groupId) {
        BigDecimal balance = splitService.getUserBalanceInGroup(userId, groupId);
        return ResponseEntity.ok(Map.of(
            "userId", userId,
            "groupId", groupId,
            "balance", balance
        ));
    }

    // Get all pending splits for a group
    @GetMapping("/pending/group/{groupId}")
    public List<Split> getPendingSplitsByGroup(@PathVariable Long groupId) {
        return splitService.getPendingSplitsByGroup(groupId);
    }

    // Mark a split as paid
    @PutMapping("/{splitId}/mark-paid")
    public Split markSplitAsPaid(@PathVariable Long splitId) {
        return splitService.markSplitAsPaid(splitId);
    }

    // Mark a split as settled
    @PutMapping("/{splitId}/mark-settled")
    public Split markSplitAsSettled(@PathVariable Long splitId) {
        return splitService.markSplitAsSettled(splitId);
    }

    // Update split amount
    @PutMapping("/{splitId}/amount")
    public Split updateSplitAmount(
            @PathVariable Long splitId, 
            @RequestParam BigDecimal newAmount) {
        return splitService.updateSplitAmount(splitId, newAmount);
    }

    // Delete a split
    @DeleteMapping("/{splitId}")
    public ResponseEntity<Void> deleteSplit(@PathVariable Long splitId) {
        splitService.deleteSplit(splitId);
        return ResponseEntity.noContent().build();
    }

    // Get total amount owed by a user across all groups
    @GetMapping("/total-owed/user/{userId}")
    public ResponseEntity<Map<String, Object>> getTotalOwedByUser(@PathVariable Long userId) {
        BigDecimal totalOwed = splitService.getTotalOwedByUser(userId);
        return ResponseEntity.ok(Map.of(
            "userId", userId,
            "totalOwed", totalOwed
        ));
    }

    // Get split by user and expense
    @GetMapping("/user/{userId}/expense/{expenseId}")
    public ResponseEntity<Split> getSplitByUserAndExpense(
            @PathVariable Long userId, 
            @PathVariable Long expenseId) {
        return splitService.getSplitByUserAndExpense(userId, expenseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 