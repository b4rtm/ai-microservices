package com.example.spam;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;


@Getter
@Setter
@Entity
@Table(name = "spam_history")
public class SpamHistoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    Long userId;
    String text;
    String category;
    double prediction;
    Date createdAt;
    boolean isDeleted;
}
