package com.sboot.moabayo.feign;

import org.springframework.cloud.openfeign.FeignClient;


//예시로 만든 feign 클라이언트입니다. 참고해서 작성해주세요

//@FeignClient(name = "Main") // Eureka에 등록된 서비스 이름
public interface MoabayoClientMain {

	// // 테스트 용도? 실험해보기
	// @PostMapping("/api/checkUser")
	// UserVO checkUser(@RequestBody LoginFormVO loginFormVO);

}
