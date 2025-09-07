package com.sboot.moabayo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


/* CORS */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/jwt/**") // 필요 범위만 열기
                .allowedOrigins(
                        "http://localhost:8812",
                        "http://localhost:8813",
                        "http://localhost:8814"
                )
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .exposedHeaders("Authorization", "Refresh-Token")
                .allowCredentials(true)            // ❗ 쿠키 동반 필수
                .maxAge(3600);                     // 프리플라이트 캐시(옵션)
    }
}
