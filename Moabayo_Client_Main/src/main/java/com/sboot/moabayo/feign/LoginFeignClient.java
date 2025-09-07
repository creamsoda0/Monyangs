
package com.sboot.moabayo.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.sboot.moabayo.vo.LoginFormVO;
import com.sboot.moabayo.vo.UserInfoVO;


// Eureka 에 등록된 서버 이름.
@FeignClient(name="LoginService")
public interface LoginFeignClient {
	// 이 URL을 입력하면 FeignClient 이름으로 등록된 LoginService 내부 URL 이 실행됨!
    // 요청하는 Origin 이 같으니까 결과적으로 Cross Origin Resource Sharing 오류가 나지 않게 됨
    @PostMapping("/user/login") // ✅ 실제 LoginService의 컨트롤러 경로에 맞게 수정
    ResponseEntity<UserInfoVO> checkUser(@RequestBody LoginFormVO form); // 여기의 checkUser 는 이 서버에서 사용할 이름으로 아무거나 지정해도 됨.
}

