package com.sboot.moabayo.vo;

import lombok.Data;

@Data
public class TxnRowVO {
    private Long id;              // account_transaction_id
    private Long userAccountId;   // user_account_id
    private String accountName;   // ua.account_name
    private String accountNumber; // ua.account_number
    private String product;       // bp.name
    private String ts;            // "YYYY-MM-DD HH24:MI"
    private String type;          // account_type (표시 라벨)
    private String category;      // category
    private String shopName;      // shop_name
    private Long amount;          // 부호 포함 원 단위
    private Long balance;         // 러닝 밸런스(해당 계좌 기준)
    private String memo;		  // 메모
}