package com.sboot.moabayo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient           // Eureka 클라이언트로 등록
@MapperScan("com.sboot.moabayo.dao")
@EnableFeignClients(basePackages = "com.sboot.moabayo.feign") // Feign 인터페이스 패키지 경로 지정 (선택)
public class MoabayoClientAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoabayoClientAdminApplication.class, args);
    }
}
