
package com.sboot.moabayo.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

// Eureka 에 등록된 서버 이름.
@FeignClient(name = "JWT")
public interface JwtFeignClient {
	@GetMapping("/jwt/verify")
	ResponseEntity<String> verifyToken(@RequestHeader("Authorization") String token);
}
