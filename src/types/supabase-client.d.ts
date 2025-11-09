declare module "@/integrations/supabase/client" {
  // Export the runtime values as `any` for TypeScript so generated Database types
  // don't block usage across the codebase while you iterate on migrations/types.
  // This file only affects the compiler, not runtime behavior.
  export const supabase: any;
  export const supabaseAny: any;
}
