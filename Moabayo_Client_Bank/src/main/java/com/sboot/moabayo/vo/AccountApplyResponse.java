package com.sboot.moabayo.vo;

public record AccountApplyResponse(
        boolean ok,
        Long user_account_id,
        String account_number,
        String account_name,
        Long balance_after_open
    ) {}