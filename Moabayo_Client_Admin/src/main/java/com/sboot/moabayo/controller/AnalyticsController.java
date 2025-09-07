package com.sboot.moabayo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sboot.moabayo.dao.AnalyticsMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
  private final AnalyticsMapper mapper;

  @GetMapping("/users-by-zip")
  public List<Map<String,Object>> usersByZip(@RequestParam(defaultValue="100") int limit) {
    return mapper.usersByZip(limit);
  }

  @GetMapping("/bank-monthly")
  public List<Map<String,Object>> bankMonthly(@RequestParam String from, @RequestParam String to) {
    return mapper.monthlyBankProduct(from, to);
  }

  @GetMapping("/card-monthly")
  public List<Map<String,Object>> cardMonthly(@RequestParam String from, @RequestParam String to) {
    return mapper.monthlyCardSales(from, to);
  }
}
