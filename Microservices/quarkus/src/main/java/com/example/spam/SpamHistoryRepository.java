package com.example.spam;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class SpamHistoryRepository implements PanacheRepository<SpamHistoryEntity> {
    public List<SpamHistoryEntity> findAllByUserId(Long id){
        return list("userId", id);
    }
}
