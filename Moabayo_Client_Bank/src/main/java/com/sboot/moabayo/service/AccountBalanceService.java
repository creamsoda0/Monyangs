package com.sboot.moabayo.service;

import org.aspectj.lang.annotation.AfterReturning;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sboot.moabayo.aspect.AccountTxLogged;
import com.sboot.moabayo.dao.BankMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountBalanceService {
	private final BankMapper bankMapper;
	
    // 계좌 업데이트 및 결제 로그 추가
	// AOP 실행 설명
	// 1. UpdateBalancePlus (밑에 있는 이 메서드) 가 실행되면
	// 2. @AccountTxLogged(type=?) 어노테이션 감지. 
	// 	  - 직접 만든 수제 어노테이션.
	// 	  - 이때 type 의 값은 @interface AccountTxLogged 의 type 에 들어간다.
	// 3. AccountTxLoggedAspect 와 포인트컷 매칭.
	//    - @AfterReturning( ... ) 부분
	// 	  - value 부분을 보면 @annotation(mark) 라고 되어있을텐데 
	// 		이건 AccountTxLogged 객체를 mark 라는 이름으로 사용하겠다는 것.
	// 4. AccountTxLoggedAspect의 writeTxLog() 실행. mark 에서 type 값을 뽑아올 수 있다.
    @Transactional
    @AccountTxLogged(type = "WITHDRAW")
    public void updateBalancePlus(
    		Long userAccountId, 
    		Long amount
	/*
	 * , String accType, // account type String category, // category String memo //
	 * memo
	 */    		) {
        // 잔액 증가
        int updated = bankMapper.updateBalancePlus(userAccountId, amount);
        if (updated == 0) {
            throw new IllegalStateException("계좌 잔액 업데이트 실패");
        }
    }
	
    @Transactional
    @AccountTxLogged(type = "DEPOSIT")
    public void updateBalanceMinus(
    		Long userAccountId, // from uaid
    		Long amount
	/*
	 * , String accType, // account type String category, // category String memo //
	 * memo
	 */    		) {
        // 잔액 차감
        int updated = bankMapper.updateBalanceMinus(userAccountId, amount);
        if (updated == 0) {
            throw new IllegalStateException("계좌 잔액 업데이트 실패");
        }
    }
}
