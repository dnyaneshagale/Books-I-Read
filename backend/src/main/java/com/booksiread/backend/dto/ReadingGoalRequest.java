package com.booksiread.backend.dto;

public class ReadingGoalRequest {

    private int year;
    private int targetBooks;

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public int getTargetBooks() { return targetBooks; }
    public void setTargetBooks(int targetBooks) { this.targetBooks = targetBooks; }
}
