package com.sboot.moabayo.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.DashboardMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardMapper dao;

    public Map<String, Object> summary() {
        Map<String, Object> m = new HashMap<>();
        m.put("newAccountsToday", dao.countNewAccountsToday());
        m.put("newCardsThisMonth", dao.countNewCardsThisMonth());
        m.put("sumTxnToday", dao.sumTxnToday());
        m.put("alerts", dao.riskAlerts(new BigDecimal("1000000"), 5)); // 예: 100만원 이상/10분 5건 이상
        return m;
    }
}