package com.sboot.moabayo.vo;

import java.util.List;

import lombok.Data;

// 계좌 조회 프론트엔드에서 보여줄 정보 반영
@Data
public class AccountVO {
    private Long id;           // user_account_id
    private String icon;       // SQL CASE 로 생성(또는 프런트에서 type→아이콘 매핑)
    private String name;       // user_account.account_name
    private String number;     // user_account.account_number
    private String product;    // bank_product.name
    private String type;       // bank_product.type (DEPOSIT|SAVINGS|LOAN 등)
    private Long balance;      // 원 단위 (TRUNC)
    private String openedAt;   // YYYY-MM-DD
    private List<TxVO> history;
}
