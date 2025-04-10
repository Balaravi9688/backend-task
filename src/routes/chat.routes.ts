import express from "express";
import multer from "multer";
import { importChat } from "../controllers/chat.controller";
import { jwtTokenAuth } from "../middleware/token.auth";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.use(jwtTokenAuth)
router.post("/import", upload.single("file"), importChat);

export default router;
