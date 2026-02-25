"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layers, AlertCircle, Loader2 } from "lucide-react";
import { signIn } from "@/auth/auth-client";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hidden admin mode — 5 clicks on the logo icon
  const [logoClicks, setLogoClicks] = useState(0);
  const isAdminMode = logoClicks >= 5;

  // Email/password form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/sales",
      });
      if (result.error) {
        setError(result.error.message || t("failedToSignInWithGoogle"));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: "/sales",
      });
      if (result.error) {
        setError(result.error.message || "Credenciales inválidas");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen relative overflow-hidden bg-background">
      {/* Dot grid — consistent texture, no light effects */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Page content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Brand */}
        <div className="mb-10 text-center">
          <button
            className="inline-flex flex-col items-center gap-3 text-foreground group focus-visible:outline-none"
            onClick={() => setLogoClicks((c) => c + 1)}
            aria-label={t("appName")}
          >
            <Layers className="h-9 w-9 text-foreground/60 group-hover:text-foreground/80 transition-colors" />
            <span className="text-[1.625rem] font-bold tracking-tight leading-none">
              {t("appName")}
            </span>
          </button>
          <p className="mt-2.5 text-sm text-muted-foreground">
            Gestión financiera para tu negocio
          </p>
        </div>

        {/* Action card — no preamble, just the action */}
        <div className="w-full max-w-sm rounded-lg border border-border bg-card px-8 py-8">
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isAdminMode ? (
            /* Admin email/password form */
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ledgr.app"
                  required
                  disabled={isLoading}
                  autoFocus
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-11 font-medium"
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Ingresar
              </Button>
              <button
                type="button"
                onClick={() => setLogoClicks(0)}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                Usar Google
              </button>
            </form>
          ) : (
            /* Google login — the only action */
            <>
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-11 font-medium"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-2.5 h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                {t("continueWithGoogle")}
              </Button>

              <p className="mt-5 text-center text-xs text-muted-foreground leading-relaxed">
                {t("termsAgreement")}{" "}
                <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                  {t("terms")}
                </span>{" "}
                {t("and")}{" "}
                <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                  {t("privacy")}
                </span>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("appName")}
        </p>
      </div>
    </div>
  );
}
