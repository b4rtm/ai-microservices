package com.example.spam;

import com.example.Mapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class SpamHistoryService {
    @Inject
    SpamHistoryRepository spamHistoryRepository;

    public SpamPageResponse getByUserId(Long id, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size > 0 ? size : 10;
        long totalElements = spamHistoryRepository.countByUserId(id);
        int totalPages = (int) Math.ceil((double) totalElements / safeSize);

        List<SpamDTO> content = spamHistoryRepository.findAllByUserId(id, safePage, safeSize)
                .stream()
                .map(Mapper::toDTO)
                .collect(Collectors.toList());

        return new SpamPageResponse(content, safePage, safeSize, totalElements, totalPages);
    }

    @Transactional
    public SpamDTO addRecord(SpamDTO dto) {
        var entity = Mapper.toEntity(dto);
        entity.setId(null);
        entity.setCreatedAt(new Date());
        entity.setDeleted(false);
        spamHistoryRepository.persist(entity);
        return Mapper.toDTO(entity);
    }

    @Transactional
    public boolean deleteRecord(Long id) {
        SpamHistoryEntity record = spamHistoryRepository.findById(id);
        if (record == null) {
            return false;
        }

        record.setDeleted(true);
        return true;
    }

}
