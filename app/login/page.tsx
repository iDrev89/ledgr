"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, AlertCircle, Loader2 } from "lucide-react";
import { signIn } from "@/auth/auth-client";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const errorMessage = err instanceof Error ? err.message : t("unexpectedError");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-950">
      {/* Gradient background with spotlight effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 100% 100%, rgba(78, 78, 108, 0.2), transparent),
            linear-gradient(to bottom, #18181b, #09090b)
          `
        }}
      />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-6 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-white hover:text-zinc-300 transition-colors"
            aria-label={t("appName")}
          >
            <Database className="h-6 w-6" />
            <span className="text-lg font-semibold tracking-tight">
              {t("appName")}
            </span>
          </Link>
        </header>

        {/* Centered Card */}
        <main className="flex-1 flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-xl font-semibold text-zinc-900">
                  {t("welcomeBack")}
                </h1>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Google Login Button */}
              <Button
                type="button"
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
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

              {/* Terms */}
              <p className="mt-6 text-center text-xs text-zinc-400 leading-relaxed">
                {t("termsAgreement")}{" "}
                <span className="text-zinc-500 underline underline-offset-2 cursor-pointer hover:text-zinc-900 transition-colors">
                  {t("terms")}
                </span>
                {" "}{t("and")}{" "}
                <span className="text-zinc-500 underline underline-offset-2 cursor-pointer hover:text-zinc-900 transition-colors">
                  {t("privacy")}
                </span>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 sm:px-8 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} {t("appName")}
        </footer>
      </div>
    </div>
  );
}
