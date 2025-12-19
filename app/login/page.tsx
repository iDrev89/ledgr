"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { signIn } from "@/auth/auth-client";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
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
        setError(result.error.message || t("failedToSignIn"));
      } else {
        router.push("/sales");
      }
    } catch (err: any) {
      setError(err.message || t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (err: any) {
      setError(err.message || t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-muted/50 via-muted/30 to-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-2xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Database className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold">{t("appName")}</span>
        </div>

        <div className="space-y-6 relative z-10">
          <h1 className="text-4xl font-bold leading-tight">
            Gestiona tu negocio
            <br />
            de forma simple y eficiente
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Control completo de ventas, inventario, gastos y reportes en una
            sola plataforma.
          </p>

          <div className="grid gap-4 pt-8">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Reportes en tiempo real</h3>
                <p className="text-sm text-muted-foreground">
                  Visualiza el rendimiento de tu negocio al instante
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 backdrop-blur-sm">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Gestión integral</h3>
                <p className="text-sm text-muted-foreground">
                  Ventas, inventario, nómina y más en un solo lugar
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground relative z-10">
          © 2025 Ledgrly. Todos los derechos reservados.
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-gradient-to-br from-muted/20 via-background to-muted/10 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Sophisticated dot pattern */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.3) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Subtle diagonal lines */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 60px, hsl(var(--primary) / 0.1) 60px, hsl(var(--primary) / 0.1) 61px)",
            }}
          />
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-2xl border-border bg-card/95 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{t("appName")}</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {t("welcomeBack")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("signInDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-10"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 px-0"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("signingIn") : t("signIn")}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("orContinueWith")}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
              {t("continueWithGoogle")}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
