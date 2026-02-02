package com.booksiread.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async Configuration - Enables asynchronous processing for AI note generation
 * 
 * Extension Notes:
 * - Tune thread pool size based on production load
 * - Add monitoring/metrics for thread pool usage
 * - Consider separate executors for different async tasks
 * - Add rejection policy handling (queue full scenarios)
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Thread pool executor for AI notes generation
     * 
     * Configuration explained:
     * - Core pool size: 2 (minimum threads always running)
     * - Max pool size: 5 (maximum concurrent AI generations)
     * - Queue capacity: 100 (pending tasks queue)
     * - Thread name prefix: For easier debugging in logs
     * 
     * Extension: Scale based on your expected concurrent users
     */
    @Bean(name = "aiNotesExecutor")
    public Executor aiNotesExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("ai-notes-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        return executor;
    }
}
