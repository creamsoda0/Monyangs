package com.sboot.moabayo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      // 개발 편의를 위해 CORS/CSRF 완화 (운영에선 tighten)
      .cors(Customizer.withDefaults())
      .csrf(csrf -> csrf
        // 정적 partial과 API는 CSRF 예외
        .ignoringRequestMatchers("/adminpage/**", "/api/**")
        // 개발 단계 전체 비활성화도 가능
        .disable()
      )

      // 세션은 무상태 (JWT 붙일 때 유리)
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

      // 권한 규칙
      .authorizeHttpRequests(auth -> auth
        // 정적 리소스 전부 허용
        .requestMatchers(
          "/", "/index.html",
          "/favicon.ico", "/robots.txt",
          "/css/**", "/js/**", "/images/**", "/fonts/**",
          "/adminpage/**"             // <- partial HTML (bank.html 등)
        ).permitAll()

        // SPA 엔트리(해시 라우터) 허용: /admin, /admin/** 로 접속하면 index.html forward됨
        .requestMatchers("/admin", "/admin/**").permitAll()

        // 개발 중 API는 열어둠 (운영에선 hasRole("ADMIN") 등으로 제한)
        .requestMatchers("/api/admin/**").permitAll()

        // 그 외는 인증 필요
        .anyRequest().authenticated()
      )

      // 로그인폼/Basic 끔 (JWT/Token 전제로)
      .httpBasic(httpBasic -> httpBasic.disable())
      .formLogin(form -> form.disable());

      // ★ 운영에서 JWT 필터를 쓰려면 여기 addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
      //   를 추가하세요.

    return http.build();
  }

  // 개발용 CORS: 프론트가 같은 도메인이면 사실 필요 없음. 필요 시만 사용.
  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowCredentials(true);
    cfg.setAllowedOriginPatterns(List.of("*"));
    cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    cfg.setAllowedHeaders(List.of("*"));
    cfg.setExposedHeaders(List.of("Authorization","Content-Type"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }
}
