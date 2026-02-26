import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/auth-client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";

const registerSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères"),
  email: z.email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  role: z.enum(["annonceur", "enseigne", "professionnel", "apporteur", "partenaire_energie"]),
  companyName: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

const roleLabels: Record<string, string> = {
  annonceur: "Annonceur (Broker, Foncière, SCI)",
  enseigne: "Enseigne / Indépendant",
  professionnel: "Professionnel (BTP, Notaire, etc.)",
  apporteur: "Apporteur d'affaires",
  partenaire_energie: "Partenaire Énergie Durable",
};

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: { role: "annonceur" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    const result = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      companyName: data.companyName || "",
      phone: data.phone || "",
    } as any);

    if (result.error) {
      setError(result.error.message || "Erreur lors de l'inscription");
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
            Créer un compte
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Rejoignez ImmoConnect.ai
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
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Jean Dupont"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-destructive text-xs">{errors.name.message}</p>
              )}
            </div>

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
                placeholder="Minimum 8 caractères"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Rôle</Label>
              <Select
                value={selectedRole}
                onValueChange={(val) =>
                  setValue("role", val as RegisterForm["role"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-destructive text-xs">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName">Société (optionnel)</Label>
              <Input
                id="companyName"
                placeholder="Nom de la société"
                {...register("companyName")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                {...register("phone")}
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inscription..." : "Créer mon compte"}
            </Button>

            <p className="text-center text-sm text-muted-foreground font-body">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
