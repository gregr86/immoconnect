import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card rounded-xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg font-heading font-bold mx-auto mb-4">
            IC
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            ImmoConnect.ai
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Connectez-vous à votre espace
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/dashboard" });
          }}
          className="space-y-4"
        >
          <div>
            <label className="font-body font-medium text-sm block mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              className="w-full border rounded-lg px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-ring bg-card"
            />
          </div>
          <div>
            <label className="font-body font-medium text-sm block mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="********"
              className="w-full border rounded-lg px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-ring bg-card"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-body font-medium rounded-lg py-2.5 hover:opacity-90 transition-opacity"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
