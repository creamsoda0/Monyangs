package com.sboot.moabayo.dao;

import java.util.List;
import java.util.Map;

import com.sboot.moabayo.vo.BankProductVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BankProductMapper {
	// 전체검색
	// Search는 findAll 로 전체 은행예적금 프론트에 넘겨주고 프론트엔드에서 필터링이나 검색을 걸려고 함.
	// 어차피 예적금 상품 갯수래봤자 얼마 안되니께 이 방식이 더 좋을것.
    List<BankProductVO> findAll();
    // accoutId 로 하나만 검색
    BankProductVO findById(int accountId);
    
    // 추가
    int insert(BankProductVO vo);
    // 수정
    int update(BankProductVO vo);
    // 삭제
    int delete(int accountId);
}