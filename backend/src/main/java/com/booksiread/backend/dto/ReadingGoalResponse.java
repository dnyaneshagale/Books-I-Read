package com.booksiread.backend.dto;

import com.booksiread.backend.entity.ReadingGoal;

public class ReadingGoalResponse {

    private Long id;
    private int year;
    private int targetBooks;
    private int booksCompleted;
    private double progressPercentage;
    private boolean completed;

    public static ReadingGoalResponse fromEntity(ReadingGoal goal) {
        ReadingGoalResponse r = new ReadingGoalResponse();
        r.setId(goal.getId());
        r.setYear(goal.getYear());
        r.setTargetBooks(goal.getTargetBooks());
        r.setBooksCompleted(goal.getBooksCompleted());
        r.setProgressPercentage(goal.getProgressPercentage());
        r.setCompleted(goal.isCompleted());
        return r;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public int getTargetBooks() { return targetBooks; }
    public void setTargetBooks(int targetBooks) { this.targetBooks = targetBooks; }
    public int getBooksCompleted() { return booksCompleted; }
    public void setBooksCompleted(int booksCompleted) { this.booksCompleted = booksCompleted; }
    public double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(double progressPercentage) { this.progressPercentage = progressPercentage; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}
