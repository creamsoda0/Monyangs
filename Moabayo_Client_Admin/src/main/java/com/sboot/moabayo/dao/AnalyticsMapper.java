package com.sboot.moabayo.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

public interface AnalyticsMapper {
  List<Map<String,Object>> usersByZip(@Param("limit") int limit);
  List<Map<String,Object>> monthlyBankProduct(@Param("from") String from, @Param("to") String to);
  List<Map<String,Object>> monthlyCardSales(@Param("from") String from, @Param("to") String to);
}
