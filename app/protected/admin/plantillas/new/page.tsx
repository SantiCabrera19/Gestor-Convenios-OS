import { BackgroundPattern } from "@/app/components/dashboard/BackgroundPattern";
import { TemplateWizard } from "@/features/templates";

export default function NewTemplatePage() {
    return (
        <>
            <BackgroundPattern />
            <div className="container mx-auto py-10 space-y-8 relative z-10">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Nueva Plantilla</h1>
                </div>

                <TemplateWizard />
            </div>
        </>
    );
}
