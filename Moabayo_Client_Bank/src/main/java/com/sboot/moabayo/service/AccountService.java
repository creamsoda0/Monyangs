package com.sboot.moabayo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.AccountMapper;
import com.sboot.moabayo.vo.AccountVO;
import com.sboot.moabayo.vo.UserVO;

@Service
public class AccountService {
	private final AccountMapper accMap;
	
	public AccountService(AccountMapper accMap) {
		this.accMap = accMap;
	}
	
	public List<AccountVO> getUserAccountsWithHistory(Long userId) {
		return accMap.findAccountsWithHistoryByUserId(userId);
	}
	
	public List<AccountVO> getAccountsByUserId(Long userId) {
		return accMap.findAccountsByUserId(userId);
	}
	
	public UserVO getUserByAccountNumber(String accNum) {
		if (accNum == null || accNum.isBlank()) {
		    throw new IllegalArgumentException("계좌번호가 비어있습니다.");
		}
		System.out.println("[AccountService.getUserByAccountNumber] accNum: " + accNum);
		System.out.println("result: " + accMap.findUserByAccountNumber(accNum));
		return accMap.findUserByAccountNumber(accNum);
	}
	
}
