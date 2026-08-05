import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "customer" | "admin";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: AppRole | null;
  userName: string | null;
  loading: boolean;
  roleLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    setRoleLoading(true);
    // Fetch role from user_roles table
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch name from users table
    const { data: profileData } = await supabase
      .from("users")
      .select("name")
      .eq("id", userId)
      .maybeSingle();

    setUserRole((roleData?.role as AppRole) ?? "customer");
    setUserName(profileData?.name ?? null);
    setRoleLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setRoleLoading(true);
          setTimeout(() => fetchUserProfile(session.user.id), 0);
        } else {
          setUserRole(null);
          setUserName(null);
          setRoleLoading(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setRoleLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserRole(null);
    setUserName(null);
    setRoleLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, userRole, userName, loading, roleLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
