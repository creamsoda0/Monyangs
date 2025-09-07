package com.sboot.moabayo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sboot.moabayo.feign.LoginFeignClient;
import com.sboot.moabayo.vo.LoginFormVO;
import com.sboot.moabayo.vo.UserInfoVO;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TokenMainController {

    private final LoginFeignClient moabayoClientMain;

    @PostMapping("/token") 
    public ResponseEntity<UserInfoVO> login(@RequestBody LoginFormVO form, HttpServletResponse response) {
        ResponseEntity<UserInfoVO> feignResponse = moabayoClientMain.checkUser(form);
        UserInfoVO user = feignResponse.getBody();
        String token = feignResponse.getHeaders().getFirst("Authorization");
        

        if (user != null && token != null) {
            response.setHeader("Authorization", token);
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(401).build();
        }
    }
}
