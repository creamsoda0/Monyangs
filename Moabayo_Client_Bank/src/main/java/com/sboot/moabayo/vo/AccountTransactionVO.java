package com.sboot.moabayo.vo;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * account_transaction 테이블 VO
 *  - ACCOUNT_TRANSACTION_ID	NUMBER(20,0)		No		1	PK
 *  - USER_ACCOUNT_ID			NUMBER(20,0)		No		2	FK(user_account.USER_ACCOUNT_ID)
 *  - APPROVED_AMOUNT			NUMBER(20,2)		Yes		3
 *  - APPROVED_NUM				VARCHAR2(255 BYTE)	Yes		4
 *  - ACCOUNT_TYPE				VARCHAR2(255 BYTE)	Yes		5
 *  - CATEGORY					VARCHAR2(255 BYTE)	Yes		6
 *  - DATE_TIME					DATE				Yes		7
 *  - SHOP_NAME					VARCHAR2(255 BYTE)	Yes		8
 *  - SHOP_NUMBER				VARCHAR2(255 BYTE)	Yes		9
 * */


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountTransactionVO {
	private Integer accTrnsId;
	private Long userAccId;
	private Integer apprAmount;
	private String 	apprNum;
	private String	accType;
	private String	category;
	private Date	dateTime;
	private String	shopName;
	private String	shopNumber;
	private String	memo;
}
