package com.settleup.config;

import com.settleup.model.*;
import com.settleup.repository.*;
import com.settleup.service.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final SplitService splitService;

    public DataLoader(UserRepository userRepository, 
                     GroupRepository groupRepository, 
                     ExpenseRepository expenseRepository,
                     SplitService splitService) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
        this.splitService = splitService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only load data if no users exist
        if (userRepository.count() > 0) {
            System.out.println("Database already has data, skipping initialization.");
            return;
        }

        System.out.println("Initializing database with sample data...");

        // Create sample users
        User alice = User.builder()
                .name("Alice Johnson")
                .email("alice@example.com")
                .password("password123")
                .build();
        userRepository.save(alice);

        User bob = User.builder()
                .name("Bob Smith")
                .email("bob@example.com")
                .password("password123")
                .build();
        userRepository.save(bob);

        User charlie = User.builder()
                .name("Charlie Brown")
                .email("charlie@example.com")
                .password("password123")
                .build();
        userRepository.save(charlie);

        User diana = User.builder()
                .name("Diana Prince")
                .email("diana@example.com")
                .password("password123")
                .build();
        userRepository.save(diana);

        User eve = User.builder()
                .name("Eve Wilson")
                .email("eve@example.com")
                .password("password123")
                .build();
        userRepository.save(eve);

        // Create sample groups
        Group roommates = Group.builder()
                .name("Roommates")
                .members(new HashSet<>(Arrays.asList(alice, bob, charlie)))
                .build();
        groupRepository.save(roommates);

        Group tripGroup = Group.builder()
                .name("Vacation Trip")
                .members(new HashSet<>(Arrays.asList(alice, bob, charlie, diana, eve)))
                .build();
        groupRepository.save(tripGroup);

        Group dinnerGroup = Group.builder()
                .name("Dinner Club")
                .members(new HashSet<>(Arrays.asList(alice, diana, eve)))
                .build();
        groupRepository.save(dinnerGroup);

        // Create sample expenses for Roommates group
        Expense rent = Expense.builder()
                .group(roommates)
                .paidBy(alice)
                .amount(new BigDecimal("1500.00"))
                .description("Monthly Rent")
                .splits(new HashSet<>())
                .build();
        rent = expenseRepository.save(rent);
        Set<Split> rentSplits = splitService.createEqualSplits(rent, roommates.getMembers());
        rent.setSplits(rentSplits);
        expenseRepository.save(rent);

        Expense utilities = Expense.builder()
                .group(roommates)
                .paidBy(bob)
                .amount(new BigDecimal("200.00"))
                .description("Electricity and Water")
                .splits(new HashSet<>())
                .build();
        utilities = expenseRepository.save(utilities);
        Set<Split> utilitySplits = splitService.createEqualSplits(utilities, roommates.getMembers());
        utilities.setSplits(utilitySplits);
        expenseRepository.save(utilities);

        // Create sample expenses for Vacation Trip group
        Expense hotel = Expense.builder()
                .group(tripGroup)
                .paidBy(diana)
                .amount(new BigDecimal("800.00"))
                .description("Hotel Booking")
                .splits(new HashSet<>())
                .build();
        hotel = expenseRepository.save(hotel);
        Set<Split> hotelSplits = splitService.createEqualSplits(hotel, tripGroup.getMembers());
        hotel.setSplits(hotelSplits);
        expenseRepository.save(hotel);

        Expense food = Expense.builder()
                .group(tripGroup)
                .paidBy(eve)
                .amount(new BigDecimal("300.00"))
                .description("Group Dinner")
                .splits(new HashSet<>())
                .build();
        food = expenseRepository.save(food);
        Set<Split> foodSplits = splitService.createEqualSplits(food, tripGroup.getMembers());
        food.setSplits(foodSplits);
        expenseRepository.save(food);

        // Create sample expenses for Dinner Club group
        Expense restaurant = Expense.builder()
                .group(dinnerGroup)
                .paidBy(alice)
                .amount(new BigDecimal("120.00"))
                .description("Italian Restaurant")
                .splits(new HashSet<>())
                .build();
        restaurant = expenseRepository.save(restaurant);
        Set<Split> restaurantSplits = splitService.createEqualSplits(restaurant, dinnerGroup.getMembers());
        restaurant.setSplits(restaurantSplits);
        expenseRepository.save(restaurant);

        // Mark some splits as paid for testing
        // Alice paid her share of utilities
        splitService.getSplitByUserAndExpense(alice.getId(), utilities.getId())
                .ifPresent(split -> splitService.markSplitAsPaid(split.getId()));

        // Bob paid his share of rent
        splitService.getSplitByUserAndExpense(bob.getId(), rent.getId())
                .ifPresent(split -> splitService.markSplitAsPaid(split.getId()));

        System.out.println("Sample data loaded successfully!");
        System.out.println("Created " + userRepository.count() + " users");
        System.out.println("Created " + groupRepository.count() + " groups");
        System.out.println("Created " + expenseRepository.count() + " expenses");
    }
} 