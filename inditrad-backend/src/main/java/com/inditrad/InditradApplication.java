package com.inditrad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InditradApplication {

	public static void main(String[] args) {
		SpringApplication.run(InditradApplication.class, args);
	}

}
