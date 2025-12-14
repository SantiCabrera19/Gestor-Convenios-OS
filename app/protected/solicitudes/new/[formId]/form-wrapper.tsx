"use client";

import { useState } from "react";
import { DynamicFormRenderer } from "@/app/components/forms/DynamicFormRenderer";
import { submitSolicitud } from "@/app/actions/submit-solicitud";
import { FormSchema } from "@/shared/types/dynamic-form";
// import { useToast } from "@/app/components/ui/use-toast"; // Assuming you have a toast hook

interface FormWrapperProps {
  formId: string;
  schema: FormSchema;
}

export function FormWrapper({ formId, schema }: FormWrapperProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { toast } = useToast(); // Uncomment if toast is available

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await submitSolicitud(formId, data);
      // Redirect is handled in the server action
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
      // toast({
      //   title: "Error",
      //   description: "Hubo un problema al enviar la solicitud. Por favor intenta nuevamente.",
      //   variant: "destructive",
      // });
      alert("Hubo un problema al enviar la solicitud.");
    }
  };

  return (
    <DynamicFormRenderer
      schema={schema}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
