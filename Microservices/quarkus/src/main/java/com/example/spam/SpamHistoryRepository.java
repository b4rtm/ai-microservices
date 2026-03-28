package com.example.spam;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class SpamHistoryRepository implements PanacheRepository<SpamHistoryEntity> {
    public List<SpamHistoryEntity> findAllByUserId(Long id, int page, int size) {
        return find("userId", id)
                .page(page, size)
                .list();
    }

    public long countByUserId(Long id) {
        return count("userId", id);
    }
}
