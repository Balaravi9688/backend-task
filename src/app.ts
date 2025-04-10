import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import taskRoutes from "./routes/task.routes";
import { initDB } from "./utils/initDb";

dotenv.config();
const PORT = process.env.PORT || 3000;

initDB();

const app = express();
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("API is running ");
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
