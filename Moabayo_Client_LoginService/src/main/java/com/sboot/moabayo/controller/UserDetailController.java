package com.sboot.moabayo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sboot.moabayo.service.LoginService;
import com.sboot.moabayo.service.UserDetailService;
import com.sboot.moabayo.vo.UserDetailVO;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userdetail")
public class UserDetailController {
	private final UserDetailService udserv;
    private static record PwCheckRequest(
    		String loginId,
    		String insertedPw
    		) {};
    private static record PwCheckResponse(
    		boolean ok,
    		String message
    		) {};
    		
    @GetMapping("/{loginId}/detail")
    public ResponseEntity<?> getUserDetail(@PathVariable String loginId) {
        if (loginId == null || loginId.isBlank()) {
            return ResponseEntity.badRequest().body("loginId is required");
        }

        UserDetailVO vo = udserv.findUserDetailByLoginId(loginId);
        if (vo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found: " + loginId);
        }
        return ResponseEntity.ok(vo);
    }
    
    private final PasswordEncoder pwEncoder;
    private final LoginService loginServ;
    
    @PostMapping("/pwcheck")
    public ResponseEntity<PwCheckResponse> validateUserPassword(
    		@RequestBody PwCheckRequest req  
    		) {
        var user = loginServ.login(req.loginId());
        boolean ok = (user != null && pwEncoder.matches(req.insertedPw(), user.getPassword()));
        return ResponseEntity.ok(new PwCheckResponse(ok, ok ? "비밀번호 일치" : "비밀번호 불일치"));
    }
	
}
