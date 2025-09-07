package com.sboot.moabayo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


/* CORS */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8812") // JS가 실행되는 주소 (혹은 *)
                .allowedMethods("*")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Refresh-Token") // ✅ 이거 추가
                .allowedMethods("*");
    }
}