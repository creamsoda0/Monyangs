package com.sboot.moabayo.dao;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

	public interface DashboardMapper {
		  int countNewAccountsToday();
		  int countNewCardsThisMonth();
		  BigDecimal sumTxnToday();
		  List<Map<String,Object>> riskAlerts(@Param("highAmount") BigDecimal highAmount,
		                                      @Param("burstCount") int burstCount);
		}


