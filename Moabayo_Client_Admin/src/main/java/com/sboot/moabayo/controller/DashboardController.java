package com.sboot.moabayo.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sboot.moabayo.service.DashboardService;

import lombok.RequiredArgsConstructor;


@RestController 
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {
  private final DashboardService dashboardService;

  @GetMapping("/summary")
  public Map<String, Object> summary() {
      return dashboardService.summary();
  }
}