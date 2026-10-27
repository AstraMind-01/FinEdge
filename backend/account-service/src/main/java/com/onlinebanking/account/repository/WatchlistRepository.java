package com.onlinebanking.account.repository;

import com.onlinebanking.account.entity.WatchlistEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<WatchlistEntity, Long> {
    List<WatchlistEntity> findByUsernameOrderByDisplayOrderAscCreatedAtAsc(String username);
    Optional<WatchlistEntity> findByUsernameAndInstrumentId(String username, String instrumentId);
    boolean existsByUsernameAndInstrumentId(String username, String instrumentId);
    void deleteByUsernameAndInstrumentId(String username, String instrumentId);
}
