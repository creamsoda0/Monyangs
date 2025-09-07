package com.sboot.moabayo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.TransactionMapper;
import com.sboot.moabayo.vo.TxnRowVO;

@Service
public class TransactionService {
    private final TransactionMapper mapper;
    public TransactionService(TransactionMapper mapper){ this.mapper = mapper; }

    public List<TxnRowVO> search(Long userId) {
        List<TxnRowVO> txJson = mapper.findHistory(userId);
        return txJson;
    }
}