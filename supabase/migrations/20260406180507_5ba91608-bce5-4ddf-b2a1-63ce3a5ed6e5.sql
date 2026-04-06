
CREATE OR REPLACE FUNCTION public.assign_role_by_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
BEGIN
  -- Determine role based on email
  IF NEW.email = 'comercial@energybrands.com.br' THEN
    _role := 'comercial';
  ELSIF NEW.email = 'logistica@energybrands.com.br' THEN
    _role := 'logistica';
  ELSIF NEW.email = 'marketing@energybrands.com.br' THEN
    _role := 'marketing';
  ELSIF NEW.email = 'gestao@energybrands.com.br' THEN
    _role := 'gestao';
  ELSE
    _role := 'gestao'; -- default
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_role_by_email();
