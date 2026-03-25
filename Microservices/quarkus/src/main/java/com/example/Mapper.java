package com.example;

import com.example.spam.SpamDTO;
import com.example.spam.SpamHistoryEntity;

public class Mapper {

    public static SpamDTO toDTO(SpamHistoryEntity entity) {
        SpamDTO dto = new SpamDTO();
        dto.id = entity.getId();
        dto.userId = entity.getUserId();
        dto.text = entity.getText();
        dto.category = entity.getCategory();
        dto.prediction = entity.getPrediction();
        dto.isDeleted = entity.isDeleted();
        return dto;
    }

    public static SpamHistoryEntity toEntity(SpamDTO dto) {
        SpamHistoryEntity entity = new SpamHistoryEntity();
        entity.setId(dto.id);
        entity.setUserId(dto.userId);
        entity.setText(dto.text);
        entity.setCategory(dto.category);
        entity.setPrediction(dto.prediction);
        entity.setDeleted(dto.isDeleted);
        return entity;
    }
}
