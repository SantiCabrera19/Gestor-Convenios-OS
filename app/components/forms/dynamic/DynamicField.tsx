"use client";

import React from "react";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { FormField } from "@/lib/types/dynamic-form";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";

interface DynamicFieldProps {
  field: FormField;
  form: UseFormReturn<any>;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  form
}) => {
  // Lógica específica para campos dependientes (ej: Días del mes)
  const renderDependentSelect = () => {
    if (field.dependsOn === 'mes') {
      const mes = form.watch('mes');
      const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      
      const mesIdx = meses.indexOf(mes);
      const dias = mesIdx >= 0 ? diasPorMes[mesIdx] : 31;
      
      return (
        <select
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...form.register(field.name)}
        >
          <option value="">Seleccionar día</option>
          {Array.from({ length: dias }, (_, i) => i + 1).map(dia => (
            <option key={dia} value={dia}>{dia}</option>
          ))}
        </select>
      );
    }
    return null;
  };

  return (
    <UIFormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label} {field.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            {(() => {
              switch (field.type) {
                case "textarea":
                  return (
                    <Textarea
                      placeholder={field.placeholder}
                      {...formField}
                    />
                  );
                case "select":
                  return (
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...formField}
                    >
                      <option value="">Seleccionar {field.label}</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  );
                case "dependent-select":
                  return renderDependentSelect();
                default:
                  return (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      {...formField}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (field.transform === 'uppercase') {
                          val = val.toUpperCase();
                        }
                        formField.onChange(val);
                      }}
                    />
                  );
              }
            })()}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
