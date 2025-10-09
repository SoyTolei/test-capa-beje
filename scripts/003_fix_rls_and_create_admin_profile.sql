-- Add missing RLS policy to allow profile creation
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create profile for existing admin user
-- This will create a profile for any user in auth.users that doesn't have one yet
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'admin')
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;
