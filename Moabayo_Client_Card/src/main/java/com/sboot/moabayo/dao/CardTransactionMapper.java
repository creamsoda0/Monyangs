// CardTransactionMapper.java
package com.sboot.moabayo.dao;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CardTransactionMapper {
	// 기존 메서드
	double sumApprovedAmountThisMonth(Long userId);

	int countAlerts(Long userId);

	// 추가할 메서드
	Double estimateReward(Long userId); // 예상 캐시백이나 포인트 계산 메서드
}