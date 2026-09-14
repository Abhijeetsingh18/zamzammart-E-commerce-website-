package com.spring.zamZamMart.dto;

import java.time.LocalDateTime;

public class EmailRecordDto {
    private String id;
    private String type; // "WELCOME", "ORDER_CONFIRMATION", "PASSWORD_RESET"
    private String fromEmail;
    private String toEmail;
    private String subject;
    private String previewText;
    private String htmlContent;
    private LocalDateTime timestamp;

    public EmailRecordDto() {
    }

    public EmailRecordDto(String id, String type, String fromEmail, String toEmail, String subject, String previewText, String htmlContent) {
        this.id = id;
        this.type = type;
        this.fromEmail = fromEmail;
        this.toEmail = toEmail;
        this.subject = subject;
        this.previewText = previewText;
        this.htmlContent = htmlContent;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFromEmail() {
        return fromEmail;
    }

    public void setFromEmail(String fromEmail) {
        this.fromEmail = fromEmail;
    }

    public String getToEmail() {
        return toEmail;
    }

    public void setToEmail(String toEmail) {
        this.toEmail = toEmail;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getPreviewText() {
        return previewText;
    }

    public void setPreviewText(String previewText) {
        this.previewText = previewText;
    }

    public String getHtmlContent() {
        return htmlContent;
    }

    public void setHtmlContent(String htmlContent) {
        this.htmlContent = htmlContent;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

