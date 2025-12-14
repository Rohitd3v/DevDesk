CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT id FROM auth.users WHERE email = user_email LIMIT 1);
END;
$$;

-- Grant execute permission only to the supabase_auth_admin role
REVOKE ALL ON FUNCTION get_user_id_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO supabase_auth_admin;
