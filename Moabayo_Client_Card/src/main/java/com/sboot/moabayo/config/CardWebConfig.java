package com.sboot.moabayo.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.sboot.moabayo.jwt.CardJwtFilter;
import com.sboot.moabayo.jwt.CardJwtGenerate;


@Configuration
public class CardWebConfig {

    @Bean
    public FilterRegistrationBean<CardJwtFilter> jwtFilter(CardJwtGenerate jwtUtil) {
        // ✅ 여기서 Spring이 CardJwtGenerate 빈을 주입해줌
        FilterRegistrationBean<CardJwtFilter> filter = new FilterRegistrationBean<>();
        filter.setFilter(new CardJwtFilter(jwtUtil));
        filter.addUrlPatterns("/secure/*");
        return filter;
    }
}
