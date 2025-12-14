import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { signOutAction } from "@/app/actions";
import { BellIcon, SearchIcon, MenuIcon, CommandIcon } from "lucide-react";
import { Navigation } from "@/app/components/layout/navigation";
import { NotificationsDropdown } from "@/app/components/layout/notifications";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Obtener el perfil del usuario
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error al obtener perfil:', profileError);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background/50 backdrop-blur-sm">
      {/* Header - Glassmorphism */}
      <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-full">
          {/* Logo Area */}
          <div className="flex items-center gap-4 w-64">
            <Link href="/protected" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
                <CommandIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                NexusDoc
              </span>
            </Link>
          </div>

          {/* Search Bar (Fake Command Palette) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Buscar acuerdos, plantillas o personas..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-muted/30 hover:bg-muted/50 focus:bg-background rounded-full border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground/70"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <NotificationsDropdown userId={user.id} />

            <div className="h-6 w-px bg-border/50 mx-1" />

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right mr-2">
                <div className="text-sm font-medium leading-none">{profile?.full_name || user.email?.split('@')[0]}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{profile?.role || 'Usuario'}</div>
              </div>

              <div className="relative group cursor-pointer">
                <div className="h-9 w-9 rounded-full ring-2 ring-background bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || "User"}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {user.email?.[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full" />
              </div>

              <form action={signOutAction} className="hidden md:block">
                <Button variant="ghost" size="icon" type="submit" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                </Button>
              </form>

              <button className="md:hidden p-2 hover:bg-muted rounded-md">
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-background/30 backdrop-blur-md">
          <Navigation userRole={profile?.role} />

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/40">
            <div className="bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-xl p-4 border border-primary/10">
              <h4 className="text-xs font-semibold text-primary mb-1">NexusDoc Pro</h4>
              <p className="text-[10px] text-muted-foreground mb-3">
                Tu plan Enterprise está activo hasta Dic 2025.
              </p>
              <div className="w-full bg-background/50 rounded-full h-1.5 mb-1">
                <div className="bg-primary h-1.5 rounded-full w-[75%]" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-auto min-w-0 relative scroll-smooth">
          {/* Content Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-transparent pointer-events-none h-32 z-10" />

          <div className="h-full p-6 md:p-8 max-w-7xl mx-auto relative z-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
