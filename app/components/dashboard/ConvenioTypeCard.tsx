import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

export type ConvenioColor = "blue" | "green" | "amber" | "purple" | "rose" | "cyan" | "orange" | "red";

export interface ConvenioTypeCardProps {
  id?: number;
  title: string;
  description: string;
  icon?: React.ReactNode; // Hacemos opcional o ignoramos
  color: ConvenioColor;
  previewUrl?: string; // Hacemos opcional o ignoramos
}

export const ConvenioTypeCard = (props: ConvenioTypeCardProps) => {
  const { 
    title, 
    description,
    color = "cyan"
  } = props;

  const buttonBgClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    amber: "bg-amber-600 hover:bg-amber-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    rose: "bg-rose-600 hover:bg-rose-700",
    cyan: "bg-cyan-600 hover:bg-cyan-700",
    orange: "bg-orange-600 hover:bg-orange-700",
    red: "bg-red-600 hover:bg-red-700",
  };

  const borderHoverClasses = {
    blue: "hover:border-blue-400/50",
    green: "hover:border-green-400/50",
    amber: "hover:border-amber-400/50",
    purple: "hover:border-purple-400/50",
    rose: "hover:border-rose-400/50",
    cyan: "hover:border-cyan-400/50",
    orange: "hover:border-orange-400/50",
    red: "hover:border-red-400/50",
  };

  const isEnabled = true;

  return (
    <div className={cn(
      "border rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-card group flex flex-col justify-between h-full",
      borderHoverClasses[color]
    )}>
      <div className="mb-4">
        <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="mt-auto pt-4">
        <Link href={`/protected/solicitudes/new/${(props as any).id || ''}`} legacyBehavior>
          <Button 
            className={cn(
              "w-full border-0",
              buttonBgClasses[color],
              "text-primary-foreground"
            )}
            disabled={!isEnabled}
          >
            Usar plantilla
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConvenioTypeCard; 
