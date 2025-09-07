package com.sboot.moabayo.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data 
@AllArgsConstructor
public class TransferResponse {
    private boolean ok;
    private String approvedNum;
    private String toName;
}
