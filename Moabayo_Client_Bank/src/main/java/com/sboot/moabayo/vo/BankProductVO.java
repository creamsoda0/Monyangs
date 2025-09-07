package com.sboot.moabayo.vo;


import lombok.Data;
/**
 * bank_product 테이블 VO
 *  - ACCOUNT_ID   NUMBER(8,0)     NOT NULL (PK)
 *  - NAME         VARCHAR2(100)   NOT NULL
 *  - IMG          VARCHAR2(255)
 *  - DESCRIPTION  VARCHAR2(1000)
 *  - CATEGORY     VARCHAR2(100)
 *  - BENEFITS     VARCHAR2(1000)  (콤마(,) 구분 문자열)
 *  - INTEREST     NUMBER(5,2)     (예: 1.20은 1.20%)
 *  - TYPE         VARCHAR2(50)    (예: Savings/Checking/Deposit/Loan)
 */
@Data
public class BankProductVO {
    private Long    accountId;   // ACCOUNT_ID
    private String     name;        // NAME
    private String     img;         // IMG
    private String     description; // DESCRIPTION
    private String     category;    // CATEGORY
    private String     benefits;    // BENEFITS
    private Double     interest;    // INTEREST (NUMBER(5,2))
    private String     type;        // TYPE
}