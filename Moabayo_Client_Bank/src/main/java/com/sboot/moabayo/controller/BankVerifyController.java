package com.sboot.moabayo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.sboot.moabayo.jwt.BankJwtGenerate;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpSession;

//@Controller
////@RequestMapping("/bank")
//public class BankVerifyController {

//    @GetMapping("/verify")
//    public ResponseEntity<String> verifyToken() {
//        // 🔐 이미 CardJwtFilter 통과했기 때문에 여기 도달한 것
//        String html = "<html><body><h1>카드 서비스 접속 완료</h1></body></html>";
//        return ResponseEntity.ok(html);
//    }
//
//	@GetMapping("/verify")
//	public String handleToken(@RequestParam String token, HttpSession session) {
//	    try {
//	    	
//	    	// Bearer 접두사 제거
//	        if (token.startsWith("Bearer ")) {
//	            token = token.substring(7); // "Bearer " 잘라내기
//	        }
//	        // 토큰 검증
//	        Jwts.parserBuilder()
//	            .setSigningKey(BankJwtGenerate.getKey())
//	            .build()
//	            .parseClaimsJws(token);
//
//	        // 검증된 토큰을 세션이나 모델에 저장 (필요시)
//	        session.setAttribute("token", token); // 또는 사용자 정보
//
//	        // URL 정리해서 리다이렉트 (토큰 제거)
//	        return "redirect:/userbank/index"; // index.html
//	    } catch (Exception e) {
//	        return "redirect:/error";
//	    }
//	}
//    
//}
