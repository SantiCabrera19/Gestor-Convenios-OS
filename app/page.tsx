import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import AccessButton from "@/app/components/AccessButton";
import { ArrowRightIcon, CloudIcon, ShieldCheckIcon, ZapIcon, GlobeIcon, DatabaseIcon, LockIcon } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar simplificado */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="p-1.5 bg-primary/20 rounded-lg">
              <GlobeIcon className="w-5 h-5 text-primary" />
            </div>
            <span>Nexus<span className="text-primary">Doc</span></span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Características</Link>
            <Link href="#security" className="hover:text-primary transition-colors">Seguridad</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Planes</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium hover:text-primary hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="shadow-lg shadow-primary/20">
                Comenzar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 flex flex-col items-center text-center px-4 relative overflow-hidden">
          {/* Efectos de fondo locales para resaltar el hero */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/10 blur-[120px] rounded-full -z-10" />

          <Badge variant="outline" className="mb-6 animate-fade-up border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-sm">
            <span className="mr-2 text-xs">✨</span> La Evolución del Gestor Documental
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1] animate-fade-up animation-delay-200">
            Gestiona tus acuerdos a la <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-violet-500 to-teal-400">velocidad de la luz</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up animation-delay-400 leading-relaxed">
            Elimina la burocracia con una plataforma SaaS inteligente. Centraliza documentos, automatiza aprobaciones y sincroniza con tu nube favorita.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up animation-delay-600">
            <AccessButton />
            <Button variant="outline" size="lg" className="h-12 px-8 border-white/10 hover:bg-white/5 gap-2 group">
              Ver Demo
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats rápidos */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-70 animate-fade-up animation-delay-800 border-t border-white/5 pt-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold">99.9%</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Uptime</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold">Google</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Drive Sync</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold">AES-256</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Encryption</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold">24/7</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Support</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 md:py-32 px-4 container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Digital */}
            <div className="group relative p-8 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-sm hover:bg-card/50 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ZapIcon className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Digital y Veloz</h3>
              <p className="text-muted-foreground leading-relaxed">
                Olvídate del papel. Crea, firma y aprueba convenios en segundos con flujos de trabajo automatizados y plantillas inteligentes.
              </p>
            </div>

            {/* Feature 2: Cloud */}
            <div className="group relative p-8 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-sm hover:bg-card/50 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CloudIcon className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sincronización Cloud</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tus datos donde los necesitas. Integración nativa con Google Drive, OneDrive y Dropbox. Copias de seguridad automáticas y acceso offline.
              </p>
            </div>

            {/* Feature 3: Security */}
            <div className="group relative p-8 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-sm hover:bg-card/50 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Seguridad Enterprise</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tranquilidad total con encriptación de grado militar, control de roles granular y auditoría completa de cada acción realizada.
              </p>
            </div>
          </div>
        </section>

        {/* Integration / Tech Section */}
        <section className="w-full py-24 md:py-32 px-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
              <Badge variant="outline" className="border-teal-500/30 text-teal-500 bg-teal-500/5">
                Infraestructura Híbrida
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold">
                El poder de la nube,<br /> la seguridad de tu servidor.
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Tú decides dónde viven tus datos. NexusDoc te permite elegir entre almacenamiento 100% cloud, servidores locales o una estrategia híbrida.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <DatabaseIcon className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium">Bases de datos distribuidas</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <LockIcon className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium">Encriptación en reposo y tránsito</span>
                </li>
              </ul>
            </div>

            {/* Visual Abstracto de Integración */}
            <div className="flex-1 relative w-full h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[100px] rounded-full" />
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="p-6 bg-card/60 backdrop-blur-md rounded-2xl border border-white/10 transform -rotate-6 hover:rotate-0 transition-transform duration-500 hover:scale-105">
                  <GlobeIcon className="w-8 h-8 text-blue-500 mb-4" />
                  <div className="h-2 w-20 bg-blue-500/20 rounded mb-2" />
                  <div className="h-2 w-12 bg-blue-500/20 rounded" />
                </div>
                <div className="p-6 bg-card/60 backdrop-blur-md rounded-2xl border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500 hover:scale-105 mt-8">
                  <CloudIcon className="w-8 h-8 text-green-500 mb-4" />
                  <div className="h-2 w-20 bg-green-500/20 rounded mb-2" />
                  <div className="h-2 w-12 bg-green-500/20 rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8 p-12 rounded-3xl bg-gradient-to-b from-card/50 to-transparent border border-white/5">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Comienza tu transformación hoy.
            </h2>
            <p className="text-xl text-muted-foreground">
              Únete a las instituciones que ya están modernizando su gestión documental.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-2xl shadow-primary/25 hover:scale-105 transition-transform">
                Obtener NexusDoc
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 border-t border-white/5 bg-black/40 text-center text-sm text-muted-foreground backdrop-blur-xl">
        <div className="container px-4 flex flex-col md:flex-row justify-between items-center">
          <p>© 2024 NexusDoc Inc. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-white transition-colors">Términos</Link>
            <Link href="#" className="hover:text-white transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
