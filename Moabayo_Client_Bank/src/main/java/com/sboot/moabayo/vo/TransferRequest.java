package com.sboot.moabayo.vo;

import lombok.Data;

@Data
public class TransferRequest {
    private String toAccountNumber; // "111-111-111"
    private String fromAccountNumber;
    private Long SendAmount;         // 양수
    private String memo;            // 선택
}