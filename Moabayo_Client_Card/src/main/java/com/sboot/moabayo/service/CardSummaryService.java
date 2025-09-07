package com.sboot.moabayo.service;

import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.CardTransactionMapper;
import com.sboot.moabayo.dao.UserCardMapper;
import com.sboot.moabayo.vo.CardSummaryVO;

@Service
public class CardSummaryService {

	private final UserCardMapper userCardMap;
	private final CardTransactionMapper txMap;

	public CardSummaryService(UserCardMapper userCardMap, CardTransactionMapper txMap) {
		this.userCardMap = userCardMap;
		this.txMap = txMap;
	}

	public CardSummaryVO getSummary(Long userId) {
		CardSummaryVO vo = new CardSummaryVO();
		vo.setOwnedCount(userCardMap.countByUserId(userId));
		vo.setTotalSpend(txMap.sumApprovedAmountThisMonth(userId));
		vo.setExpectedReward(txMap.estimateReward(userId));
		vo.setAlertsCount(txMap.countAlerts(userId));
		vo.setDaysUntilBilling(7); // 예시값
		return vo;
	}
}