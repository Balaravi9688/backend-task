import { Router } from "express";
import { getTasks, createTask } from "../controllers/task.controller";
import { jwtTokenAuth } from "../middleware/token.auth";

const router = Router();

router.use(jwtTokenAuth);
router.get("/getTask", getTasks);
router.post("/createTask", createTask);

export default router;
