package com.sboot.moabayo.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;

import com.sboot.moabayo.vo.PwCheckRequest;
import com.sboot.moabayo.vo.PwCheckResponse;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

//Eureka 에 등록된 서버 이름.
@FeignClient(name="LoginService", path="/api/userdetail")
public interface UserDataFeignClient {
	@PostMapping("/pwcheck")
    PwCheckResponse pwcheck(@RequestBody PwCheckRequest req);
}
