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

    public List<SpamDTO> getByUserId(Long id){
        return spamHistoryRepository.findAllByUserId(id)
                .stream()
                .map(Mapper::toDTO)
                .collect(Collectors.toList());
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
