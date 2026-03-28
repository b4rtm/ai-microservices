package com.example.spam;

import java.util.List;

public class SpamPageResponse {
    public List<SpamDTO> content;
    public int page;
    public int size;
    public long totalElements;
    public int totalPages;

    public SpamPageResponse(List<SpamDTO> content, int page, int size, long totalElements, int totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }
}

