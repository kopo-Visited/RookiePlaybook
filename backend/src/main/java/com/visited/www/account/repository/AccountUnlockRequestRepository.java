package com.visited.www.account.repository;

import com.visited.www.account.entity.AccountUnlockRequest;
import com.visited.www.account.entity.AccountUnlockRequestStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountUnlockRequestRepository extends JpaRepository<AccountUnlockRequest, Long> {

    List<AccountUnlockRequest> findAllByOrderByCreatedAtDesc();

    long countByStatus(AccountUnlockRequestStatus status);
}
