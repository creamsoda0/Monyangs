package com.sboot.moabayo.swagger;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("모아봐요 모으냥즈 - LoginService API 문서")
                        .version("1.0")
                        .description("모으냥즈 LoginService 프로젝트 Swagger 문서입니다."));
    }
}
