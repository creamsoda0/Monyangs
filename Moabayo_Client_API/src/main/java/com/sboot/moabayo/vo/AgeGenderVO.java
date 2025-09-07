package com.sboot.moabayo.vo;

import com.opencsv.bean.CsvBindByName;

import lombok.Data;

@Data
public class AgeGenderVO {

	@CsvBindByName(column = "UPJONG_CD")
	private String UPJONG_CD;
	
	@CsvBindByName(column = "YM")
	private int YM;
	
	@CsvBindByName(column = "GENDER")
	private String GENDER;
	
	@CsvBindByName(column = "AGE")
	private String AGE;
	
	@CsvBindByName(column = "CARD_TOTAL")
	private int CARD_TOTAL;
	
	@CsvBindByName(column = "CARD_TRY")
	private int CARD_TRY;
	
	
}
