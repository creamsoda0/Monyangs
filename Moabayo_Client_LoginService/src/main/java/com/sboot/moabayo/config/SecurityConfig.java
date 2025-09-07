package com.sboot.moabayo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public SecurityFilterChain filter(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable())

				// ✅ CORS 적용
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				// ✅ 세션 비활성화 (JWT 방식)
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				// ✅ URL별 권한 설정
				.authorizeHttpRequests(
						auth -> auth.requestMatchers("/css/**", "/js/**", "/images/**", "/", "/error").permitAll()
								.requestMatchers(HttpMethod.POST, "/user/login").permitAll().anyRequest().permitAll());

		return http.build();
	}

	// ✅ CORS 설정
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();

		config.setAllowedOriginPatterns(List.of("http://localhost:8810", // UI 서버
				"http://localhost:8812" // Main 서버 (html)
		));

		config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setExposedHeaders(List.of("Authorization", "Refresh-Token"));
		config.setAllowCredentials(true); // 쿠키 허용

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	// ✅ 비밀번호 인코더
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
