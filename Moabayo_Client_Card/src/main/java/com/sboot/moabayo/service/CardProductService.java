package com.sboot.moabayo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.CardProductMapper;
import com.sboot.moabayo.vo.CardProductVO;

@Service
public class CardProductService {

    private final CardProductMapper mapper;

    public CardProductService(CardProductMapper mapper) {
        this.mapper = mapper;
    }

//    public List<CardProductVO> getRecommendCards() {
//        return mapper.getRecommendCards();
//    }
//    

    public List<CardProductVO> findAll() {
        return mapper.selectAll();
    }
}