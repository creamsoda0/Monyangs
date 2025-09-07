package com.sboot.moabayo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.BankProductMapper;
import com.sboot.moabayo.vo.BankProductVO;

@Service
public class BankProductService {
    private final BankProductMapper bankProductMapper;

    public BankProductService(BankProductMapper bankProductMapper) {
        this.bankProductMapper = bankProductMapper;
    }
    
    // findAll(): 전체검색
    public List<BankProductVO> findAll() {
    	
    	return bankProductMapper.findAll();
    }
    
    // getById(accountId): accountId로 검색하여 상품의 상세정보를 가져온다.
    public BankProductVO getById(int accountId) {
        BankProductVO vo = bankProductMapper.findById(accountId);
        if (vo == null) {
            throw new IllegalArgumentException("BankProduct not found: accountId=" + accountId);
        }
        return vo;
    }
}
