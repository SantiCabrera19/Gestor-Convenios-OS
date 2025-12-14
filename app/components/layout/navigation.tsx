"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  HomeIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  SettingsIcon,
  ShieldIcon,
  LayoutDashboardIcon,
  FilesIcon,
  HistoryIcon,
  CheckSquareIcon
} from "lucide-react";
import { useLoadingNavigation } from "@/app/hooks/use-loading-navigation";
import { cn } from "@/lib/utils";

interface NavigationProps {
  userRole?: string;
}

export function Navigation({ userRole }: NavigationProps) {
  const pathname = usePathname();
  const { navigate } = useLoadingNavigation();
  const isAdmin = userRole === "admin";
  const isProfesor = userRole === "profesor";

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string, label: string) => {
    navigate(path, `Navegando a ${label}...`);
  };

  const NavItem = ({
    path,
    label,
    icon: Icon
  }: {
    path: string;
    label: string;
    icon: any;
  }) => (
    <button
      onClick={() => handleNavigation(path, label)}
      className={cn(
        "group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
        isActive(path)
          ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon className={cn(
        "h-4 w-4 transition-colors",
        isActive(path) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )} />
      {label}
      {isActive(path) && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      )}
    </button>
  );

  return (
    <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
      {/* Main Module */}
      <div className="space-y-2">
        <div className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2">
          General
        </div>
        <NavItem path="/protected" label="Dashboard" icon={LayoutDashboardIcon} />
        <NavItem path="/protected/convenios-lista" label="Acuerdos" icon={FilesIcon} />
        <NavItem path="/protected/actividad" label="Actividad" icon={HistoryIcon} />
        <NavItem path="/protected/aprobaciones" label="Aprobaciones" icon={CheckSquareIcon} />
      </div>

      {/* Admin Module */}
      {isAdmin && (
        <div className="space-y-2">
          <div className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2">
            Administración
          </div>
          <NavItem path="/protected/admin" label="Panel Admin" icon={ShieldIcon} />
          <NavItem path="/protected/admin/configuracion" label="Configuración" icon={SettingsIcon} />
          <NavItem path="/protected/admin/plantillas" label="Plantillas" icon={FileTextIcon} />
        </div>
      )}

      {/* Professor Module */}
      {isProfesor && (
        <div className="space-y-2">
          <div className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2">
            Docente
          </div>
          <NavItem path="/protected/profesor" label="Panel Profesor" icon={UserIcon} />
        </div>
      )}
    </nav>
  );
}
