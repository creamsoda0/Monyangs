package com.sboot.moabayo.service;

import org.springframework.stereotype.Service;

// 필요시 RestTemplate/WebClient 로 실제 API 호출로 대체
@Service
public class KakaoPayService {

    /** Ready 호출 (스텁) */
    public KakaoReadyResponse ready(int amount, String successUrl, String cancelUrl, String failUrl) {
        KakaoReadyResponse r = new KakaoReadyResponse();
        // 실제 카카오일 경우 next_redirect_pc_url 을 반환
        // 지금은 성공 URL로 바로 가는 스텁 (개발용)
        String redirect = successUrl + "?pg_token=DEV_TOKEN&tid=TID-DEV-123";
        r.setNextRedirectPcUrl(redirect);
        r.setTid("TID-DEV-123");
        return r;
    }

    /** Approve 호출 (스텁) */
    public KakaoApproveResponse approve(Long amount, String pgToken, String tidFromQuery) {
        KakaoApproveResponse a = new KakaoApproveResponse();
        a.setTid(tidFromQuery != null ? tidFromQuery : "TID-DEV-123");
        KakaoApproveResponse.Amount amt = new KakaoApproveResponse.Amount();
        
		/*
		 * amt.setTotal(10000); // 데모 값. 여기에 amount 를 넣어야됨 우리 결제값
		 */ 
        amt.setTotal(amount);
        
        a.setAmount(amt);
        a.setApprovedAt(java.time.LocalDateTime.now());
        return a;
    }
}
