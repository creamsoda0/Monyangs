package com.sboot.moabayo.service;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class KakaoApproveResponse {
    private String tid;
    private Amount amount;
    private LocalDateTime approvedAt;
    // getter/setter
    public String getTid(){ return tid; }
    public void setTid(String tid){ this.tid = tid; }
    public Amount getAmount(){ return amount; }
    public void setAmount(Amount amount){ this.amount = amount; }
    public LocalDateTime getApprovedAt(){ return approvedAt; }
    public void setApprovedAt(LocalDateTime t){ this.approvedAt = t; }

    public static class Amount{
        private Long total;
        public Long getTotal(){ return total; }
        public void setTotal(Long total){ this.total = total; }
    }
    
}