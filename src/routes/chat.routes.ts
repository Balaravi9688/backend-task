import { Router } from "express";
import multer, { StorageEngine } from "multer";
import { importChat } from "../controllers/chat.controller";
import { jwtTokenAuth } from "../middleware/token.auth";

const router: Router = Router();

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.use(jwtTokenAuth);
router.post("/import", upload.single("file"), importChat);

export default router;
