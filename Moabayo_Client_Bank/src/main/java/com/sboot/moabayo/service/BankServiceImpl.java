package com.sboot.moabayo.service;

import java.util.List;

import org.apache.commons.logging.Log;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sboot.moabayo.dao.BankMapper;
import com.sboot.moabayo.vo.AccountTxMeta;
import com.sboot.moabayo.vo.AccountTxMetaHolder;
import com.sboot.moabayo.vo.AccountVO;
import com.sboot.moabayo.vo.UserVO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankServiceImpl implements BankService {
    private final BankMapper bankMapper;
    private final AccountBalanceService accBalServ;

    public UserVO getUser(String loginId) {
        return bankMapper.findUserByLoginId(loginId);
    }
    
    public AccountVO getNyangcoinAccount(Long userId) {
    	
        return bankMapper.findNyangcoinAccountByUserId(userId);
    }

    @Override
    @Transactional
    public void insertAccountTransactionLog(Long userId, Long accountId, Long approvedAmount,
                                            String approvedNum, String accountType, String category,
                                            String shopName, String shopNumber, String memo) {
        Long userAccountId = bankMapper.findUserAccountId(userId, accountId);
        log.info("userId={}, class={}", userId, (userId==null? null : userId.getClass().getName()));
        if (userAccountId == null) {
            throw new IllegalArgumentException("계좌를 찾을 수 없습니다.");
        }

        bankMapper.insertTransaction(userAccountId, approvedAmount, approvedNum,
                accountType, category, shopName, shopNumber, memo);
    }
    
    @Override
    @Transactional
    public void transfer(Long senderUserId, String senderAccountNum, Long receiverUserId, String receiverAccountNum,
    		Long amount, String approvedNum, String memo)  {


    	long senderAccId = bankMapper.findUserAccountByUsernameAccNum(senderUserId, senderAccountNum);
    	long receiverAccId = bankMapper.findUserAccountByUsernameAccNum(receiverUserId, receiverAccountNum);

        if (senderAccId == 0) throw new IllegalArgumentException("보내는 계좌가 없습니다.");
        if (receiverAccId   == 0) throw new IllegalArgumentException("받는 계좌가 없습니다.");

        // (선택) 잔액 체크를 엄격히 하려면 BankMapper에 잔액 조회 쿼리 추가해서 비교하세요.

        // 2) 출금 (AOP가 거래로그 남김)
        AccountTxMetaHolder.set(AccountTxMeta.builder()
            .approvedAmount(amount)
            .approvedNum(approvedNum)
            .accountType("WITHDRAW")
            .category("TRANSFER_OUT")
            .shopName("계좌이체")
            .shopNumber("모으냥즈 은행 번호")
            .memo(memo)
            .build()
        );
        accBalServ.updateBalanceMinus(senderAccId, amount);

        // 3) 입금 (AOP가 거래로그 남김)
        AccountTxMetaHolder.set(AccountTxMeta.builder()
            .approvedAmount(amount)
            .approvedNum(approvedNum)
            .accountType("DEPOSIT")
            .category("TRANSFER_IN")
            .shopName("계좌이체")
            .shopNumber("모으냥즈 은행 번호")
            .memo(memo)
            .build()
        );
        accBalServ.updateBalancePlus(receiverAccId, amount);
    }
}