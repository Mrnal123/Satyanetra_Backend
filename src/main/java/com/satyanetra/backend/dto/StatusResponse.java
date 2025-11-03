package com.satyanetra.backend.dto;

import java.util.List;

public class StatusResponse {
    private String status;
    private int progress;
    private List<String> logs;

    public StatusResponse() {}
    public StatusResponse(String status, int progress, List<String> logs) {
        this.status = status;
        this.progress = progress;
        this.logs = logs;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    public List<String> getLogs() { return logs; }
    public void setLogs(List<String> logs) { this.logs = logs; }
}