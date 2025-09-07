package com.sboot.moabayo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MoabayoClientCardApplication {

	public static void main(String[] args) {
		SpringApplication.run(MoabayoClientCardApplication.class, args);
	}

}
