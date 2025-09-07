package com.sboot.moabayo.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sboot.moabayo.vo.AccountVO;
import com.sboot.moabayo.vo.UserVO;

@Mapper
public interface AccountMapper {
    List<AccountVO> findAccountsWithHistoryByUserId(@Param("userId") Long userId);
    List<AccountVO> findAccountsByUserId(@Param("userId") Long userId);
    UserVO findUserByAccountNumber(@Param("accNum") String accNum);
    List<Map<String,Object>> findSimpleAccountsByUserId(@Param("userId") Long userId);
    int existsAccountNumber(@Param("accountNumber") String accountNumber);
    void insertUserAccount(Map<String,Object> row);
}
