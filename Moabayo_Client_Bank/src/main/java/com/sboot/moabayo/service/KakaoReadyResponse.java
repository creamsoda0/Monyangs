package com.sboot.moabayo.service;

import lombok.Data;

@Data
public class KakaoReadyResponse {
	private int amount;
	private String tid;
    private String nextRedirectPcUrl;
    // getter/setter
    
    public String getTid(){ return tid; }
    public void setTid(String tid){ this.tid = tid; }
    public String getNextRedirectPcUrl(){ return nextRedirectPcUrl; }
    public void setNextRedirectPcUrl(String u){ this.nextRedirectPcUrl = u; }
}
