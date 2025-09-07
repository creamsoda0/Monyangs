package com.sboot.moabayo.service;

import org.apache.ibatis.annotations.Param;

import com.sboot.moabayo.vo.AccountVO;
import com.sboot.moabayo.vo.UserVO;

public interface BankService {

    /**
     * 계좌 잔액 업데이트
     * @param userId 유저 ID
     * @param accountId 계좌 ID
     * @param amount 계좌 변동 금액 (Plus 증가, Minus 감소)
     */
	// 계좌 잔액 업데이트 부분은 AOP 반영을 위해 AccountBalanceService 로 분리함. 250824
	// void updateBalancePlus(Long userAccountId, Integer amount);
    // void updateBalanceMinus(Long userAccountId, Integer amount);
    /**
     * 계좌 거래 로그 추가
     * @param userId 유저 ID
     * @param accountId 계좌 ID
     * @param amount 승인 금액
     * @param approvedNum 승인 번호 (결제사 TID 등)
     * @param accountType 계좌 타입 (예: "SAVING")
     * @param category 거래 카테고리
     * @param shopName 가맹점명
     * @param shopNumber 가맹점 번호
     */
    void insertAccountTransactionLog(Long userId,
                                     Long accountId,
                                     Long amount,
                                     String approvedNum,
                                     String accountType,
                                     String category,
                                     String shopName,
                                     String shopNumber,
                                     String memo);

	UserVO getUser(String loginId);
	AccountVO getNyangcoinAccount(Long userId);
	

    // ✅ 새로 추가: 전체 이체 트랜잭션
	void transfer(Long senderUserId, String senderAccountNum, Long receiverUserId, String receiverAccountNum,
			Long amount, String approvedNum, String memo);

	
	
}
