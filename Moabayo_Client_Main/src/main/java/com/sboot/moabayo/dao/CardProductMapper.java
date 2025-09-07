// com.sboot.moabayo.mapper.CardProductMapper
package com.sboot.moabayo.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CardProductMapper {
    int updateImageUrl(@Param("cardId") Long cardId, @Param("imgUrl") String imgUrl);
    Integer existsById(@Param("cardId") Long cardId);
}
