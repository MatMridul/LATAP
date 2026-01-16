// Lightweight Metrics
// Cost-aware counters for key business actions

class MetricsCollector {
  constructor() {
    this.counters = {
      verification_attempts_total: 0,
      verification_failures_total: 0,
      applications_created_total: 0,
      applications_rejected_total: 0,
      premium_gated_requests_total: 0,
      matching_requests_total: 0,
      auth_attempts_total: 0,
      auth_failures_total: 0,
      opportunities_created_total: 0
    };
  }

  increment(metric, value = 1) {
    if (this.counters.hasOwnProperty(metric)) {
      this.counters[metric] += value;
    }
  }

  getAll() {
    return { ...this.counters };
  }

  reset() {
    Object.keys(this.counters).forEach(key => {
      this.counters[key] = 0;
    });
  }

  // Log metrics periodically
  logMetrics() {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      action_type: 'METRICS_SNAPSHOT',
      metrics: this.counters
    }));
  }
}

// Singleton instance
const metrics = new MetricsCollector();

// Log metrics every 5 minutes
setInterval(() => {
  metrics.logMetrics();
}, 5 * 60 * 1000);

module.exports = metrics;
