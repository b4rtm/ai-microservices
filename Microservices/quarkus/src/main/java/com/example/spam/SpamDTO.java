package com.example.spam;

import java.util.Date;

public class SpamDTO {
    public Long id;
    public Long userId;
    public String text;
    public String category;
    public double prediction;
    public boolean isDeleted;

    public SpamDTO() {}
}
