package com.finedge.admin.service;

import com.finedge.admin.entity.SystemSetting;
import com.finedge.admin.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    public SystemSettingService(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    @Transactional(readOnly = true)
    public List<SystemSetting> getSettingsByCategory(String category) {
        return systemSettingRepository.findByCategory(category);
    }

    @Transactional
    public SystemSetting updateSetting(SystemSetting setting) {
        return systemSettingRepository.save(setting);
    }
}

