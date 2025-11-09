import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        hasChecked.current = false;
        return;
      }

      // Only check once per user session
      if (hasChecked.current) {
        return;
      }

      try {
        console.log('useAdmin: checking admin role for user', user.id);

        // 1) Try RPC has_role (preferred: SECURITY DEFINER function)
        let rpcOk = false;
        try {
          // Cast supabase to any to avoid strict generated types for RPC/functions/table names
          const rpcRes = await (supabase as any).rpc('has_role', { _user_id: user.id, _role: 'admin' });
          console.log('useAdmin: has_role rpc response', rpcRes);
          const rpcData = rpcRes?.data;
          if (rpcRes?.error) throw rpcRes.error;

          // Interpret multiple possible return shapes
          if (
            rpcData === true ||
            (Array.isArray(rpcData) && rpcData[0] === true) ||
            (rpcData && typeof rpcData === 'object' && (rpcData.count > 0 || rpcData.has_role === true)) ||
            (Array.isArray(rpcData) && rpcData[0] && (rpcData[0] === true || rpcData[0].has_role === true))
          ) {
            setIsAdmin(true);
            rpcOk = true;
            hasChecked.current = true;
          }
        } catch (err) {
          console.warn('useAdmin: has_role rpc failed or not available, falling back to client query', err);
        }

        // 2) Fallback to client-side select with a few retries (handles timing issues)
        if (!rpcOk) {
          let attempts = 0;
          while (attempts < 3) {
            // Cast supabase to any to avoid 'never' table-name typing errors from generated Database types
            const { data, error } = await (supabase as any)
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .maybeSingle();

            console.log('useAdmin: roles query attempt', attempts + 1, { data, error });

            if (error) {
              // If auth not ready or transient error, wait and retry
              attempts++;
              await new Promise((r) => setTimeout(r, 500));
              continue;
            }

            setIsAdmin(!!data);
            hasChecked.current = true;
            break;
          }
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-renders

  return { isAdmin, loading };
};
