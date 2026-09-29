package com.finedge.admin.controller;

import com.finedge.admin.entity.User;
import com.finedge.admin.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/users")
public class UserManagementController {

    private final UserService userService;

    public UserManagementController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<Page<User>> getUsers(Pageable pageable) {
        // Omitting Specification filtering for brevity in this boilerplate
        return ResponseEntity.ok(userService.getUsers(null, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<User> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_SUSPEND')")
    public ResponseEntity<User> updateStatus(
            @PathVariable UUID id, 
            @RequestParam User.AccountStatus status, 
            @RequestParam String reason) {
        return ResponseEntity.ok(userService.updateUserStatus(id, status, reason));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
