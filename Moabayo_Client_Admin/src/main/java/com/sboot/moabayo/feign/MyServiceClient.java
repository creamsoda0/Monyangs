package com.sboot.moabayo.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.sboot.moabayo.vo.UserVo;


//예시로 만든 feign 클라이언트입니다. 참고해서 작성해주세요

@FeignClient(name = "my-service") // Eureka에 등록된 서비스 이름
public interface MyServiceClient {

    @GetMapping("/api/data")
    UserVo getData();
	
}
