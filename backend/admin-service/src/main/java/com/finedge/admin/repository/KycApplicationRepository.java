package com.finedge.admin.repository;

import com.finedge.admin.entity.KycApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface KycApplicationRepository extends JpaRepository<KycApplication, UUID> {
}
