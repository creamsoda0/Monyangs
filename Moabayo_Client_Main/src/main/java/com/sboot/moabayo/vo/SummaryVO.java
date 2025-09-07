package com.sboot.moabayo.vo;

import lombok.Data;

@Data
public class SummaryVO {
	
	private int asset;//단순 잔액 합계
	private int accounts; //단순 계좌 갯수
	private int cards; // 단순 카드 갯수

}
