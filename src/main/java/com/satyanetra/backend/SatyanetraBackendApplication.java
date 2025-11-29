package com.satyanetra.backend;

import com.satyanetra.backend.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.boot.web.context.WebServerApplicationContext;

@SpringBootApplication
public class SatyanetraBackendApplication {

    private static final Logger log = LoggerFactory.getLogger(SatyanetraBackendApplication.class);

    @Autowired
    private AppProperties appProperties;

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(SatyanetraBackendApplication.class);
        app.setWebApplicationType(WebApplicationType.SERVLET);  // ✅ Force servlet mode
        app.run(args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logBoundConfiguration(ApplicationReadyEvent event) {
        String origin = appProperties.getFrontendOrigin();
        int rateLimitPerMin = appProperties.getRateLimitPerMin();
        int timeout = appProperties.getDefaultTimeoutSeconds();

        int port = 0;
        try {
            WebServerApplicationContext ctx = (WebServerApplicationContext) event.getApplicationContext();
            port = ctx.getWebServer().getPort();
        } catch (Exception e) {
            log.warn("Unable to determine server port from context: {}", e.getMessage());
        }

        log.info("✅ Server started on port {}", port);
        log.info("Config bound: frontend.origin={}, rate.limit.per.min={}, default.timeout={}", origin, rateLimitPerMin, timeout);
    }
}
