import { APIStressTester } from "../libs/APIStressTester.js";

export const stress_test = async (req, res) => {
    const { 
      targetApiUrl, 
      endpoint, 
      method, 
      concurrentRequests, 
      totalRequests 
    } = req.body;
  
    try {
      const tester = new APIStressTester(targetApiUrl);
      const results = await tester.performConcurrentRequests({
        endpoint,
        method,
        concurrentRequests,
        totalRequests
      });
  
      res.json({
        status: 'success',
        data: results
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }


export const rate_limit = async (req, res) => {
  const { 
    targetApiUrl, 
    endpoint, 
    requestsPerSecond, 
    duration 
  } = req.body;
  try {
    const tester = new APIStressTester(targetApiUrl);
    const results = await tester.testRateLimiting({
      endpoint,
      requestsPerSecond,
      duration
    });

    res.json({
      status: 'success',
      data: results
    });
    console.log(results)
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}


export const vulnerability_scan = async (req, res) => {
  const { 
    targetApiUrl, 
    endpoint,
    testPayloads 
  } = req.body;

  try {
    const tester = new APIStressTester(targetApiUrl);
    const results = await tester.performVulnerabilityScan({
      endpoint,
      testPayloads
    });

    res.json({
      status: 'success',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}