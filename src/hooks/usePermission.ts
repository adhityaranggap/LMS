import { useAuth } from '../context/AuthContext';

export function usePermission(name: string): boolean {
  const { user } = useAuth();
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return user.permissions?.includes(name) ?? false;
}

export function useHasAnyPermission(...names: string[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return names.some(name => user.permissions?.includes(name));
}
