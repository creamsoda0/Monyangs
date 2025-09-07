package com.sboot.moabayo.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

public interface BankMapper {
  List<Map<String,Object>> searchAccounts(@Param("q") String q,
                                          @Param("limit") int limit,
                                          @Param("offset") int offset);
  List<Map<String,Object>> listCardProducts(@Param("limit") int limit, @Param("offset") int offset);
  List<Map<String,Object>> searchTransactions(@Param("from") String from, @Param("to") String to,
                                              @Param("category") String category,
                                              @Param("limit") int limit, @Param("offset") int offset);
}
