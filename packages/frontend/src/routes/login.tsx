import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { Logo } from "@/components/logo";

const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema as any),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      setError(result.error.message || "Identifiants incorrects");
      return;
    }

    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-xl shadow-sm">
        <CardHeader className="text-center pb-2">
          <Logo className="h-10 w-auto mx-auto mb-4" />
          <h1 className="font-heading font-bold text-2xl text-foreground">
            ImmoConnect.ai
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Connectez-vous à votre espace
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 font-body">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>

            <p className="text-center text-sm text-muted-foreground font-body">
              Pas encore de compte ?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
