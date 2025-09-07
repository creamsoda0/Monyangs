package com.sboot.moabayo.vo;

import lombok.Data;

/** 
 * user_account 테이블 vo
 *  - USER_ACCOUNT_ID	NUMBER(20,0)		No		1	
 *  - USER_ID			NUMBER(20,0)		No		2	FK(user.USER_ID)
 *  - ACCOUNT_ID		NUMBER(8,0)			No		3	FK(bank_product.ACCOUNT_ID)
 *  - ACCOUNT_NUMBER	VARCHAR2(30 BYTE)	No		4	
 *  - ACCOUNT_NAME		VARCHAR2(100 BYTE)	Yes		5	
 * */


@Data
public class UserAccountVO {
	private Integer userAccId;
	private Integer userId;
	private Integer accId;
	private String 	accNumber;
	private String	accName;
}
