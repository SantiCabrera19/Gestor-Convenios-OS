import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginWithGoogle from "@/app/components/auth/login-with-google";
import { signInAction } from "@/app/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CommandIcon } from "lucide-react";

export default async function SignIn({
  searchParams,
}: {
  searchParams: { message?: string } | Promise<{ message?: string }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const params = await searchParams;
  const error = params?.error;
  const success = params?.success;
  const message = params?.message;

  if (user) {
    return redirect("/protected/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 animate-fade-up">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Area */}
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="group">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-300 mb-6">
              <CommandIcon className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            NexusDoc
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sistema Operativo de Documentos Inteligentes
          </p>
        </div>

        <Card className="border-white/10 bg-card/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu espacio de trabajo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" action={signInAction}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  required
                  className="bg-background/50"
                  defaultValue={params?.email}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-background/50"
                />
              </div>

              {(error || message) && (
                <div className="bg-destructive/15 text-destructive text-center p-3 rounded-md text-sm font-medium border border-destructive/20">
                  {error || message}
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/15 text-emerald-500 text-center p-3 rounded-md text-sm font-medium border border-emerald-500/20">
                  {success}
                </div>
              )}

              <Button className="w-full shadow-lg shadow-primary/25" type="submit">
                Iniciar Sesión
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/50 px-2 text-muted-foreground backdrop-blur-sm rounded-full">
                  O continúa con
                </span>
              </div>
            </div>

            <LoginWithGoogle />
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/sign-up" className="font-medium text-primary hover:underline transition-colors">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} NexusDoc Inc. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}