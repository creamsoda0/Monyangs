package com.sboot.moabayo.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.sboot.moabayo.vo.CardProductVO;

@Mapper
public interface CardProductMapper {
//    List<CardProductVO> getRecommendCards();
    
    int updateImageUrl(Long cardId, String imgUrl);
    Integer existsById(Long cardId);

    List<CardProductVO> selectAll(); // ★ 추가
}