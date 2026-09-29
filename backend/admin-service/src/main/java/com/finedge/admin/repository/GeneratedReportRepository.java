package com.finedge.admin.repository;

import com.finedge.admin.entity.GeneratedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GeneratedReportRepository extends JpaRepository<GeneratedReport, UUID> {
}
