import { Router } from "express";
import { rate_limit, stress_test, vulnerability_scan } from "../controllers/tester_controller.js";
const testRoutes = Router()


testRoutes.post('/stress-test', stress_test)
testRoutes.post('/rate-limit-test', rate_limit)
testRoutes.post('/vulnerability-scan', vulnerability_scan)




export default testRoutes
