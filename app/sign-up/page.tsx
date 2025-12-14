import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginWithGoogle from "@/app/components/auth/login-with-google";
import { signUpAction } from "@/app/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CommandIcon } from "lucide-react";

export default async function SignUp({
  searchParams,
}: {
  searchParams: { message?: string } | Promise<{ message?: string }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const params = await searchParams;
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
            Únete a la plataforma de gestión inteligente
          </p>
        </div>

        <Card className="border-white/10 bg-card/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>
              Completa tus datos para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" action={signUpAction}>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Juan Pérez"
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-background/50"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-md text-center text-sm font-medium ${message.includes("Revisa tu correo")
                    ? "bg-green-500/15 text-green-500"
                    : "bg-destructive/15 text-destructive"
                  }`}>
                  {message}
                </div>
              )}

              <Button className="w-full shadow-lg shadow-primary/25" type="submit">
                Registrarse
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/50 px-2 text-muted-foreground backdrop-blur-sm rounded-full">
                  O regístrate con
                </span>
              </div>
            </div>

            <LoginWithGoogle />
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/sign-in" className="font-medium text-primary hover:underline transition-colors">
                Inicia sesión
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