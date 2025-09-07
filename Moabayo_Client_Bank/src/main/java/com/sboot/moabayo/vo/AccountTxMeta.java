package com.sboot.moabayo.vo;

import lombok.Builder;
import lombok.Data;

//거래 로그에 같이 저장할 선택적 정보들
@Data @Builder
public class AccountTxMeta {
 private Long approvedAmount; // 없으면 메서드 인자 amount 사용
 private String approvedNum;
 private String accountType; // 없으면 애노테이션 type 사용
 private String category;
 private String shopName;
 private String shopNumber;
 private String memo;
}

