package com.sboot.moabayo.vo;

import lombok.Data;

@Data
public class CardProductVO {
    private Long   cardId;
    private String img;         // DB에 저장된 전체 경로(URL)
    private String name;
    private String brand;
    private String description;
    private String category;
    private String benefits;    // "영화 할인,카페 10%" 처럼 저장되었다고 가정
    private Double interest;
    private int limit;			// 카드 한도 int
    private String type;        
}
