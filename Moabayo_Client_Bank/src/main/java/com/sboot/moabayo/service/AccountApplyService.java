package com.sboot.moabayo.service;

import com.sboot.moabayo.vo.AccountApplyRequest;
import com.sboot.moabayo.vo.AccountApplyResponse;

public interface AccountApplyService {
    AccountApplyResponse apply(
            Long userId, 
            AccountApplyRequest req
            );
}
