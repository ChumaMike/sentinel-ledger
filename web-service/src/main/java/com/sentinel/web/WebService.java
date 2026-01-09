package com.sentinel.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EntityScan(basePackages = {"com.sentinel.web.model", "com.sentinel.common.model"})
@EnableJpaRepositories(basePackages = "com.sentinel.web.repository")
@ComponentScan(basePackages = {"com.sentinel.web", "com.sentinel.common"})
public class WebService {

    public static void main(String[] args) {
        SpringApplication.run(WebService.class, args);
    }
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}