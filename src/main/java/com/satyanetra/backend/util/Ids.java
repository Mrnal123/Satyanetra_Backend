package com.satyanetra.backend.util;

import java.util.UUID;

public class Ids {
    public static String prodId() { return "prod_" + UUID.randomUUID(); }
    public static String jobId() { return "job_" + UUID.randomUUID(); }
    public static String scoreId() { return "score_" + UUID.randomUUID(); }
}