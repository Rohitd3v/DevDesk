
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
// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://localhost:3001"
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in the explicitly allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Check for Vercel preview deployments
    // Matches https://dev-desk-*-rohit8bitcoders-projects.vercel.app
    const vercelPreviewPattern = /^https:\/\/dev-desk-.*-rohit8bitcoders-projects\.vercel\.app$/;
    if (vercelPreviewPattern.test(origin)) {
      return callback(null, true);
    }

    // Check for direct Vercel app domain if needed (optional, safer to stick to specific patterns)
    // const vercelAppPattern = /\.vercel\.app$/;
    // if (vercelAppPattern.test(origin)) return callback(null, true);

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
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

import notificationRouter from "./routes/notificationRouter.js";

import githubWebhookRouter from "./routes/githubWebhookRouter.js";

// Routes
app.use("/api/v1/auth", authRouters);
app.use("/api/v1/auth", githubAuthRouter);
app.use("/api/v1/profiles", authProfiles);
app.use("/api/v1/projects", authprojects);
app.use("/api/v1/ticket", ticketsRouter);
app.use("/api/v1/ticketcomment", ticketcommentsRouter);
app.use("/api/v1/ticketAction", ticketActionRouter);
app.use("/api/v1/github", githubRepoRouter);
app.use("/api/v1/webhooks/github", githubWebhookRouter);
app.use("/api/v1/notifications", notificationRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

export default app;


