package com.sboot.moabayo.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

public interface SettingsMapper {
  List<Map<String,Object>> listHolidays();
  int addHoliday(@Param("date") String date, @Param("note") String note);
  int deleteHoliday(@Param("id") Long id);

  List<Map<String,Object>> loadConfig();
  int saveConfig(@Param("key") String key, @Param("value") String value);
}
