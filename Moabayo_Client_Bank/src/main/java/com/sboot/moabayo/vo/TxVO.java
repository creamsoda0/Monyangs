package com.sboot.moabayo.vo;

import lombok.Data;

@Data
public class TxVO {
    private String ts;     // YYYY-MM-DD HH24:MI
    private String type;   // account_type (혹은 한글 라벨로 CASE)
    private Long amount;   // 부호 포함 원 단위
    private Long bal;      // 이 거래 시점의 잔액(러닝밸런스)
}
