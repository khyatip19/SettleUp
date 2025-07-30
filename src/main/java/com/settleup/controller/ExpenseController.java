package com.settleup.controller;

import com.settleup.model.Expense;
import com.settleup.service.ExpenseService;
import com.settleup.dto.AddExpenseRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/expense")
public class ExpenseController {
    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseService.getAllExpenses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Expense createExpense(@RequestBody Expense expense) {
        return expenseService.createExpense(expense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/add")
    public Expense addExpense(@RequestParam Long groupId,
                             @RequestParam Long paidById,
                             @RequestParam BigDecimal amount,
                             @RequestParam String description) {
        return expenseService.addExpense(groupId, paidById, amount, description);
    }

    @PostMapping("/flex")
    public Expense addExpenseFlexible(@RequestBody AddExpenseRequest request) {
        return expenseService.addExpense(request);
    }
} 