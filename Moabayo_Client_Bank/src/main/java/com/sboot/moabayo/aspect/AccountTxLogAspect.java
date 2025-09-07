package com.sboot.moabayo.aspect;

import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.sboot.moabayo.dao.BankMapper;
import com.sboot.moabayo.vo.AccountTxMeta;
import com.sboot.moabayo.vo.AccountTxMetaHolder;

import lombok.RequiredArgsConstructor;

@Aspect
@Component
@RequiredArgsConstructor
public class AccountTxLogAspect {

    private final BankMapper bankMapper;

    // 시그니처: (Long userAccountId, Integer amount) 를 타겟
    @AfterReturning(
    		  value = "@annotation(mark) && args(userAccountId, amount, ..)",
    		  argNames = "mark,userAccountId,amount")
    public void writeTxLog(AccountTxLogged mark,
                           Long userAccountId,
                           Integer amount) {	
    	// 메타데이터 읽기(읽고 비움)
        AccountTxMeta meta = AccountTxMetaHolder.getAndClear();

        Integer approvedAmount = (meta != null && meta.getApprovedAmount() != null)
                ? meta.getApprovedAmount() : amount;
        String approvedNum = (meta != null) ? meta.getApprovedNum() : null;
        String accountType = (meta != null && meta.getAccountType() != null)
                ? meta.getAccountType() : mark.type();   // 기본은 어노테이션 type
        String category   = (meta != null) ? meta.getCategory()   : null;
        String shopName   = (meta != null) ? meta.getShopName()   : null;
        String shopNumber = (meta != null) ? meta.getShopNumber() : null;
        String memo       = (meta != null) ? meta.getMemo()       : null;

        // AOP 진입했는지 로그 기록용
        // 각 변수에 어떤 데이터가 담기는가?
        System.out.println("[AOP.writeTxLog] AccountTxMeta meta: " + meta);
        System.out.println("userAccountId: " + userAccountId);
        System.out.println("approvedAmount: " + approvedAmount);
        System.out.println("approvedNum: " + approvedNum);
        System.out.println("accountType: " + accountType);
        System.out.println("category: " + category);
        System.out.println("shopName: " + shopName);
        System.out.println("shopNumber: " + shopNumber);
        System.out.println("memo: " + memo);
        
        // 커밋 후 기록
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
        	System.out.println("if(TransactionSynchronizationManager.isSynchronizationActive()) == " + 
        TransactionSynchronizationManager.isSynchronizationActive());
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override public void afterCommit() {
                        bankMapper.insertTransaction(
                            userAccountId,
                            approvedAmount,
                            approvedNum,
                            accountType,
                            category,
                            shopName,
                            shopNumber,
                            memo
                        );
                    }
                }
            );
        } else {
        	System.out.println("if else... (TransactionSynchronizationManager.isSynchronizationActive()) == " + 
        TransactionSynchronizationManager.isSynchronizationActive());
            bankMapper.insertTransaction(
                userAccountId, approvedAmount, approvedNum,
                accountType, category, shopName, shopNumber, memo
            );
        }
    }
}
