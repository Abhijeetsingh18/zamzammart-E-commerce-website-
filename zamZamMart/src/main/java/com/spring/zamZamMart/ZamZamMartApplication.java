package com.spring.zamZamMart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ZamZamMartApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZamZamMartApplication.class, args);
        System.out.println("=================================================");
        System.out.println("   ZamZam Mart Backend is running on port 8080!  ");
        System.out.println("   H2 Console: http://localhost:8080/h2-console    ");
        System.out.println("   API Root:   http://localhost:8080/api           ");
        System.out.println("=================================================");
    }
}

