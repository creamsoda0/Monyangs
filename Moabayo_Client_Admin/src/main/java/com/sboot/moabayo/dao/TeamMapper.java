package com.sboot.moabayo.dao;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

public interface TeamMapper {
  List<Map<String,Object>> listAdmins(@Param("limit") int limit, @Param("offset") int offset);
  int updateAdminRole(@Param("adminId") Long adminId, @Param("role") String role);
}
