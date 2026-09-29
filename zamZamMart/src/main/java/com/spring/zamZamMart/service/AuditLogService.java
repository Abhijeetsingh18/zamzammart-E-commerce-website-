package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.AuditLog;
import com.spring.zamZamMart.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(String adminEmail, String action, String details) {
        AuditLog log = new AuditLog(adminEmail, action, details);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
