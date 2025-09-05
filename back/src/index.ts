import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes";
import categoryRouter from "./routes/category.routes";
import whoRouter from "./routes/who.routes";
import historyRouter from "./routes/history.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/whos", whoRouter);
app.use("/api/histories", historyRouter);

app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중`);
});
