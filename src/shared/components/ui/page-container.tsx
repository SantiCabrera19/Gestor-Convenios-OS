import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
}

export function PageContainer({
    children,
    className,
    fullWidth = false,
    ...props
}: PageContainerProps) {
    return (
        <div
            className={cn(
                "w-full p-6 md:p-8 animate-fade-up",
                !fullWidth && "max-w-7xl mx-auto",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
