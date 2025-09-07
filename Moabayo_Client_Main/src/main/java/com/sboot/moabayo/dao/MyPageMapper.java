package com.sboot.moabayo.dao;

import org.apache.ibatis.annotations.Mapper;

import com.sboot.moabayo.vo.UserVO;

@Mapper
public interface MyPageMapper {
  int selectSumBalance(String userId);
  int selectAccountCount(String userId);
  int selectCardCount(String userId);

  UserVO selectProfile(Long userId);

  // ★ @Param으로 이름을 명시!
  int updateProfile(@org.apache.ibatis.annotations.Param("userId") Long userId,
                    @org.apache.ibatis.annotations.Param("p") UserVO p);

  int updatePassword(@org.apache.ibatis.annotations.Param("userId") Long userId,
                     @org.apache.ibatis.annotations.Param("enc") String enc);
}
