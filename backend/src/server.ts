
import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import authRouters from "./routes/authRouter.js";
import authProfiles from "./routes/profileRouter.js";
import authprojects from "./routes/projectsRouter.js";
import ticketsRouter from "./routes/ticketsRouter.js";
import ticketcommentsRouter from "./routes/ticketCommentsRouter.js";
import ticketActionRouter from "./routes/ticketActivityRouter.js";
dotenv.config();
const app = express();
app.use(cors())
app.use(express.json());

app.use("/api/v1/auth", authRouters);
app.use("/api/v1/profiles", authProfiles);
app.use("/api/v1/projects", authprojects);
app.use("/api/v1/ticket", ticketsRouter);
app.use("/api/v1/ticketcomment", ticketcommentsRouter)
app.use("/api/v1/ticketAction", ticketActionRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);


