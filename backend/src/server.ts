
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import passport from "./config/passport.js";
import authRouters from "./routes/authRouter.js";
import authProfiles from "./routes/profileRouter.js";
import authprojects from "./routes/projectsRouter.js";
import ticketsRouter from "./routes/ticketsRouter.js";
import ticketcommentsRouter from "./routes/ticketCommentsRouter.js";
import ticketActionRouter from "./routes/ticketActivityRouter.js";
import githubAuthRouter from "./routes/githubAuthRouter.js";
import githubRepoRouter from "./routes/githubRepoRouter.js";

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

// Routes
app.use("/api/v1/auth", authRouters);
app.use("/api/v1/auth", githubAuthRouter);
app.use("/api/v1/profiles", authProfiles);
app.use("/api/v1/projects", authprojects);
app.use("/api/v1/ticket", ticketsRouter);
app.use("/api/v1/ticketcomment", ticketcommentsRouter);
app.use("/api/v1/ticketAction", ticketActionRouter);
app.use("/api/v1/github", githubRepoRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);


