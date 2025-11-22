import { supabaseAuth } from "../config/supabaseClient.js";

export const AuthService = {
  signUp: async (email, password) => {
    return supabaseAuth.auth.signUp({ email, password });
  },

  signIn: async (email, password) => {
    return supabaseAuth.auth.signInWithPassword({ email, password });
  },
};
