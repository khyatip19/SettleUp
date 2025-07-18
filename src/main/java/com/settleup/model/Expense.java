package com.settleup.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Group group;

    @ManyToOne
    private User paidBy;

    private BigDecimal amount;
    private String description;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL)
    private Set<Split> splits;
} 