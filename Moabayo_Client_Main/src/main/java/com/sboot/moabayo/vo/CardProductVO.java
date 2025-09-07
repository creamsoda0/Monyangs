
package com.sboot.moabayo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardProductVO {
    private Long cardId;
    private String img;        // ← 이거 필요
    private String name;
    private String brand;
    private String description;
    private String category;
    private String benefits;
    private Double interest;
    private String type;
}

