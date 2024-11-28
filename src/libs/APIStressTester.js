import axios from 'axios'

export class APIStressTester {
    constructor(targetApiUrl) {
      this.targetApiUrl = targetApiUrl;
      this.metrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        responseTimesMs: [],
        statusCodeDistribution: {}
      };
    }
  
    async performConcurrentRequests({
      endpoint,
      method = 'get',
      concurrentRequests = 10,
      totalRequests = 100,
      payload = null,
      headers = {}
    }) {
      const requestPromises = [];
  
      for (let i = 0; i < totalRequests; i++) {
        const startTime = performance.now();
        
        const requestPromise = axios({
          method,
          url: `${this.targetApiUrl}/${endpoint}`,
          data: payload,
          headers
        })
        .then(response => {
          const endTime = performance.now();
          
          this.metrics.totalRequests++;
          this.metrics.successfulRequests++;
          this.metrics.responseTimesMs.push(endTime - startTime);
          
          // Track status code distribution
          this.metrics.statusCodeDistribution[response.status] = 
            (this.metrics.statusCodeDistribution[response.status] || 0) + 1;
          
          return response;
        })
        .catch(error => {
          this.metrics.failedRequests++;
          
          // Track error status codes
          if (error.response) {
            this.metrics.statusCodeDistribution[error.response.status] = 
              (this.metrics.statusCodeDistribution[error.response.status] || 0) + 1;
          }
          
          return error;
        });
  
        requestPromises.push(requestPromise);
  
        // Manage concurrency
        if (requestPromises.length >= concurrentRequests) {
          await Promise.race(requestPromises);
        }
      }
  
      await Promise.all(requestPromises);
  
      return this.calculateMetrics();
    }
  
    calculateMetrics() {
      return {
        totalRequests: this.metrics.totalRequests,
        successfulRequests: this.metrics.successfulRequests,
        failedRequests: this.metrics.failedRequests,
        successRate: (this.metrics.successfulRequests / this.metrics.totalRequests) * 100,
        averageResponseTimeMs: this.calculateAverageResponseTime(),
        statusCodeDistribution: this.metrics.statusCodeDistribution
      };
    }
  
    calculateAverageResponseTime() {
      if (this.metrics.responseTimesMs.length === 0) return 0;
      
      const totalTime = this.metrics.responseTimesMs.reduce((a, b) => a + b, 0);
      return totalTime / this.metrics.responseTimesMs.length;
    }
  
    async testRateLimiting({
      endpoint,
      requestsPerSecond,
      duration = 60 // seconds
    }) {
      const startTime = Date.now();
      let requestsMade = 0;
      let rateLimitHits = 0;
  
      while (Date.now() - startTime < duration * 1000) {
        try {
          const response = await axios.get(`${this.targetApiUrl}/${endpoint}`);
          
          if (response.status === 429) {  // Too Many Requests
            rateLimitHits++;
          }
          
          requestsMade++;
          await new Promise(resolve => setTimeout(resolve, 1000 / requestsPerSecond));
        } catch (error) {
          if (error.response && error.response.status === 429) {
            rateLimitHits++;
          }
          break;
        }
      }
  
      return {
        totalRequests: requestsMade,
        rateLimitHits,
        averageRequestsPerSecond: requestsMade / duration
      };
    }
  
    async performVulnerabilityScan({
      endpoint,
      testPayloads = [
        { name: 'SQL Injection', payload: "' OR 1=1 --" },
        { name: 'XSS', payload: "<script>alert('XSS')</script>" },
        { name: 'Large Payload', payload: 'x'.repeat(100000) },
        { name: 'Path Traversal', payload: "../../etc/passwd" }
      ]
    }) {
      const vulnerabilityResults = [];
  
      for (const test of testPayloads) {
        try {
          const response = await axios.post(`${this.targetApiUrl}/${endpoint}`, {
            input: test.payload
          });
  
          vulnerabilityResults.push({
            testName: test.name,
            statusCode: response.status,
            potentiallyVulnerable: response.status !== 400
          });
        } catch (error) {
          vulnerabilityResults.push({
            testName: test.name,
            error: error.message,
            statusCode: error.response ? error.response.status : null
          });
        }
      }
  
      return vulnerabilityResults;
    }
  }