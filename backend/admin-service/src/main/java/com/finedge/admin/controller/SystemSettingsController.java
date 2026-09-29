package com.finedge.admin.controller;

import com.finedge.admin.entity.SystemSetting;
import com.finedge.admin.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/settings")
public class SystemSettingsController {

    private final SystemSettingService settingService;

    public SystemSettingsController(SystemSettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping("/{category}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE')")
    public ResponseEntity<List<SystemSetting>> getSettingsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(settingService.getSettingsByCategory(category));
    }

    @PatchMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SystemSetting> updateSetting(@RequestBody SystemSetting setting) {
        return ResponseEntity.ok(settingService.updateSetting(setting));
    }
}
