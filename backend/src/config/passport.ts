import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { supabaseAuth } from "./supabaseClient.ts";
import { GitHubTokenService } from "../services/githubService.ts";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn("⚠️  GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env");
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const { data: user, error } = await supabaseAuth.auth.admin.getUserById(id);
    if (error) throw error;
    done(null, user.user);
  } catch (error) {
    done(error, null);
  }
});

// GitHub OAuth Strategy
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/v1/auth/github/callback`,
        scope: ["user:email", "repo"],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Extract user info from GitHub profile
          const githubEmail = profile.emails?.[0]?.value;
          const githubUsername = profile.username;
          const githubId = profile.id;
          const avatarUrl = profile.photos?.[0]?.value;

          if (!githubEmail) {
            return done(new Error("No email found in GitHub profile"), null);
          }

          // Check if user exists in Supabase by email
          let { data: existingUser, error: getUserError } = await supabaseAuth.auth.admin.listUsers();
          
          if (getUserError) {
            console.error("Error fetching users:", getUserError);
            return done(getUserError, null);
          }

          let user = existingUser.users.find(u => u.email === githubEmail);

          if (!user) {
            // Create new user in Supabase
            const { data: newUser, error: createError } = await supabaseAuth.auth.admin.createUser({
              email: githubEmail,
              email_confirm: true,
              user_metadata: {
                github_username: githubUsername,
                github_id: githubId,
                avatar_url: avatarUrl,
                provider: "github",
              },
            });

            if (createError) {
              console.error("Error creating user:", createError);
              return done(createError, null);
            }

            user = newUser.user;
          } else {
            // Update existing user with GitHub info
            const { error: updateError } = await supabaseAuth.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                github_username: githubUsername,
                github_id: githubId,
                avatar_url: avatarUrl,
              },
            });

            if (updateError) {
              console.error("Error updating user:", updateError);
            }
          }

          // Store GitHub token
          const { error: tokenError } = await GitHubTokenService.storeUserToken(
            user.id,
            accessToken,
            refreshToken,
            {
              login: githubUsername,
              id: githubId,
              avatar_url: avatarUrl,
            }
          );

          if (tokenError) {
            console.error("Error storing GitHub token:", tokenError);
          }

          return done(null, user);
        } catch (error) {
          console.error("GitHub OAuth error:", error);
          return done(error, null);
        }
      }
    )
  );
}

export default passport;