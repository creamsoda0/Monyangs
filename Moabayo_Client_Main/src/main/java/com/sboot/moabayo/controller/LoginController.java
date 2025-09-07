package com.sboot.moabayo.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sboot.moabayo.feign.LoginFeignClient;
import com.sboot.moabayo.vo.LoginFormVO;
import com.sboot.moabayo.vo.UserInfoVO;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/user")
public class LoginController {

    private final LoginFeignClient loginFeignClient;

    public LoginController(LoginFeignClient loginFeignClient) {
        this.loginFeignClient = loginFeignClient;
    }

    @PostMapping("/validate")
    public ResponseEntity<UserInfoVO> login(@RequestBody LoginFormVO form) {
        // 🔐 로그인 서버에 로그인 요청
        ResponseEntity<UserInfoVO> userResponse = loginFeignClient.checkUser(form);

        // ✅ 응답 상태 확인
        if (userResponse.getStatusCode() == HttpStatus.OK) {
            // ✅ JWT 토큰 헤더에서 꺼내기
            String token = userResponse.getHeaders().getFirst("Authorization");

            if (token != null) {
                // ✅ 토큰을 헤더에 담아 프론트로 전달
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", token);  // 필수
                headers.setAccessControlExposeHeaders(List.of("Authorization", "Refresh-Token"));
                return ResponseEntity
                        .status(userResponse.getStatusCode()) // ✅ 수정
                        .headers(headers)
                        .body(userResponse.getBody());
            }
        }

        // ❌ 인증 실패 시
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        // 1) 서버 세션 무효화
        var session = request.getSession(false);
        if (session != null) session.invalidate();

        boolean secure = request.isSecure(); // https면 true
        // 과거에 쿠키를 만든 가능성 있는 경로들을 모두 시도
        String[] paths = { "/", "/mypage", "/api" };

        for (String p : paths) {
            // USER_ID도 반드시 만료!
            response.addHeader("Set-Cookie",
                ResponseCookie.from("USER_ID", "")
                    .path(p).httpOnly(false).secure(secure).sameSite("Lax")
                    .maxAge(0).build().toString());

            response.addHeader("Set-Cookie",
                ResponseCookie.from("ACCESS_TOKEN", "")
                    .path(p).httpOnly(true).secure(secure).sameSite("Lax")
                    .maxAge(0).build().toString());

            response.addHeader("Set-Cookie",
                ResponseCookie.from("EXP", "")
                    .path(p).httpOnly(false).secure(secure).sameSite("Lax")
                    .maxAge(0).build().toString());

            // 세션 쿠키도 정리 (세션 안 써도 무해)
            response.addHeader("Set-Cookie",
                ResponseCookie.from("JSESSIONID", "")
                    .path(p).maxAge(0).build().toString());
        }

        // ⚠️ 도메인을 명시해 설정했었다면, 동일 도메인으로 한 번 더 삭제 호출 필요
        // 예: .domain("example.com") 추가 (localhost에서는 domain 설정하지 마세요)

        return ResponseEntity.noContent().build();
    }

}
