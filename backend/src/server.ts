
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import passport from "./config/passport.ts";
import authRouters from "./routes/authRouter.ts";
import authProfiles from "./routes/profileRouter.ts";
import authprojects from "./routes/projectsRouter.ts";
import ticketsRouter from "./routes/ticketsRouter.ts";
import ticketcommentsRouter from "./routes/ticketCommentsRouter.ts";
import ticketActionRouter from "./routes/ticketActivityRouter.ts";
import githubAuthRouter from "./routes/githubAuthRouter.ts";
import githubRepoRouter from "./routes/githubRepoRouter.ts";

dotenv.config();
const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
}));

app.use(express.json());

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

import notificationRouter from "./routes/notificationRouter.ts";

// Routes
app.use("/api/v1/auth", authRouters);
app.use("/api/v1/auth", githubAuthRouter);
app.use("/api/v1/profiles", authProfiles);
app.use("/api/v1/projects", authprojects);
app.use("/api/v1/ticket", ticketsRouter);
app.use("/api/v1/ticketcomment", ticketcommentsRouter);
app.use("/api/v1/ticketAction", ticketActionRouter);
app.use("/api/v1/github", githubRepoRouter);
app.use("/api/v1/notifications", notificationRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);


