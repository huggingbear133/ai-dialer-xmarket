"use client";

import { createBrowserClient, CookieOptions } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const pairs = document.cookie.split("; ").map(pair => {
            const [name, value] = pair.split("=");
            return { name, value };
          });
          return pairs;
        },
        setAll: (cookiesList: { name: string; value: string; options?: CookieOptions }[]) => {
          cookiesList.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=/; ${options?.sameSite ? `SameSite=${options.sameSite}; ` : ""}${options?.secure ? "Secure; " : ""}${options?.httpOnly ? "HttpOnly; " : ""}`
          });
        }
      }
    }
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile in the database
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert([
            {
              user_id: authData.user.id,
              email: email,
              subscription_tier: 'free',
              subscription_status: 'active',
              credits_balance: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ], {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile');
        }

        // Create default agent settings
        const { error: settingsError } = await supabase
          .from('agent_settings')
          .upsert([
            {
              user_id: authData.user.id,
              agent_name: 'Agent',
              gender: 'male',
              position: 'Sales Representative',
              languages: ['English'],
              automation_enabled: false,
              max_calls_batch: 10,
              retry_interval: 15,
              max_attempts: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ], {
            onConflict: 'user_id'
          });

        if (settingsError) {
          console.error('Settings creation error:', settingsError);
          throw new Error('Failed to create agent settings');
        }

        toast({
          title: "Registration Successful",
          description: "Please check your email to confirm your registration.",
          variant: "success",
        });

        router.push("/login");
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and password to create an account.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your password"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Registering..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
