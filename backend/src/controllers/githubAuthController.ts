import type { Request, Response, NextFunction } from "express";
import passport from "../config/passport.ts";
import { supabaseAuth } from "../config/supabaseClient.ts";
import { sendResponse } from "../utils/sendResponse.ts";

// Initiate GitHub OAuth
export const initiateGitHubAuth = (req: Request, res: Response, next: NextFunction) => {
  // Store the frontend URL for redirect after auth
  const frontendUrl = req.query.redirect || process.env.FRONTEND_URL || "http://localhost:3001";
  req.session = req.session || {};
  (req.session as any).frontendUrl = frontendUrl;
  
  passport.authenticate("github", { scope: ["user:email", "repo"] })(req, res, next);
};

// Handle GitHub OAuth callback
export const handleGitHubCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("github", { failureRedirect: "/auth/github/error" }, async (err: any, user: any) => {
    if (err) {
      console.error("GitHub auth error:", err);
      const frontendUrl = (req.session as any)?.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3001";
      return res.redirect(`${frontendUrl}/login?error=github_auth_failed`);
    }

    if (!user) {
      const frontendUrl = (req.session as any)?.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3001";
      return res.redirect(`${frontendUrl}/login?error=github_auth_cancelled`);
    }

    try {
      // Generate Supabase session for the user
      const { data: session, error: sessionError } = await supabaseAuth.auth.admin.generateLink({
        type: "magiclink",
        email: user.email!,
      });

      if (sessionError) {
        console.error("Error generating session:", sessionError);
        const frontendUrl = (req.session as any)?.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3001";
        return res.redirect(`${frontendUrl}/login?error=session_creation_failed`);
      }

      // Extract token from the magic link
      const url = new URL(session.properties.action_link);
      const token = url.searchParams.get("token");
      const refreshToken = url.searchParams.get("refresh_token");

      if (!token) {
        const frontendUrl = (req.session as any)?.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3001";
        return res.redirect(`${frontendUrl}/login?error=token_extraction_failed`);
      }

      // Redirect to frontend with tokens
      const frontendUrl = (req.session as any)?.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3001";
      const redirectUrl = new URL(`${frontendUrl}/auth/github/success`);
      redirectUrl.searchParams.set("access_token", token);
      if (refreshToken) {
        redirectUrl.searchParams.set("refresh_token", refreshToken);
      }
      redirectUrl.searchParams.set("user", JSON.stringify(user));

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("Callback processing error:", error);
      const frontendUrl = (req.session as any)?.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3001";
      res.redirect(`${frontendUrl}/login?error=callback_processing_failed`);
    }
  })(req, res, next);
};

// Handle GitHub auth errors
export const handleGitHubError = (req: Request, res: Response) => {
  const frontendUrl = (req.session as any)?.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3001";
  res.redirect(`${frontendUrl}/login?error=github_auth_error`);
};

// Link GitHub account to existing user
export const linkGitHubAccount = async (req: Request, res: Response) => {
  // This would be called from a protected route where user is already authenticated
  // Implementation would be similar to the OAuth flow but for linking existing accounts
  sendResponse(res, 501, false, { error: "GitHub account linking not yet implemented" });
};

// Unlink GitHub account
export const unlinkGitHubAccount = async (req: Request, res: Response) => {
  // Implementation for unlinking GitHub account
  sendResponse(res, 501, false, { error: "GitHub account unlinking not yet implemented" });
};