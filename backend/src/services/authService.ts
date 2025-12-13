import { supabaseAuth } from "../config/supabaseClient.ts";

export const AuthService = {
  signUp: async (email: string, password: string) => {
    return supabaseAuth.auth.signUp({ email, password });
  },

  signIn: async (email: string, password: string) => {
    return supabaseAuth.auth.signInWithPassword({ email, password });
  },
};
