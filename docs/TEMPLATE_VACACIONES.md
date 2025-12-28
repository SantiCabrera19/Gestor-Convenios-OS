# Plantilla: Solicitud de Vacaciones

**Instrucciones:** Copia este texto en un archivo Word (.docx). Las variables entre `{{llaves}}` serán reemplazadas automáticamente por los datos del formulario.

---

## Texto de la Plantilla (copiar a Word)

```
                                    SOLICITUD DE VACACIONES

Fecha: {{fecha_solicitud}}

A: Departamento de Recursos Humanos
De: {{nombre_empleado}}

---

DATOS DEL SOLICITANTE

Nombre Completo: {{nombre_empleado}}
DNI: {{dni}}
Número de Legajo: {{numero_legajo}}
Departamento: {{departamento}}
Cargo: {{cargo}}
Fecha de Ingreso: {{fecha_ingreso}}

---

DETALLE DE LA SOLICITUD

Período de vacaciones solicitado:
  - Fecha de inicio: {{fecha_inicio_vacaciones}}
  - Fecha de fin: {{fecha_fin_vacaciones}}
  - Cantidad de días: {{cantidad_dias}}

Días de vacaciones disponibles: {{dias_disponibles}}
Días de vacaciones utilizados este año: {{dias_utilizados}}

---

CONTACTO DURANTE LAS VACACIONES

Teléfono de emergencia: {{telefono_emergencia}}
Email alternativo: {{email_alternativo}}

---

OBSERVACIONES

{{observaciones}}

---

Declaro que la información proporcionada es correcta y me comprometo a cumplir con las políticas de la empresa respecto al goce de vacaciones.


_______________________________
Firma del Empleado
{{nombre_empleado}}
DNI: {{dni}}


PARA USO EXCLUSIVO DE RRHH

Estado: ☐ Aprobado  ☐ Rechazado  ☐ Pendiente
Aprobado por: _______________________________
Fecha de aprobación: _______________________________
Observaciones RRHH: _______________________________
```

---

## Campos del Formulario a Crear

| Campo | Nombre Variable | Tipo | Requerido |
|-------|-----------------|------|-----------|
| Nombre Completo | `nombre_empleado` | texto | ✅ |
| DNI | `dni` | texto (8 dígitos) | ✅ |
| Número de Legajo | `numero_legajo` | texto | ✅ |
| Departamento | `departamento` | select/texto | ✅ |
| Cargo | `cargo` | texto | ✅ |
| Fecha de Ingreso | `fecha_ingreso` | fecha | ✅ |
| Fecha Inicio Vacaciones | `fecha_inicio_vacaciones` | fecha | ✅ |
| Fecha Fin Vacaciones | `fecha_fin_vacaciones` | fecha | ✅ |
| Cantidad de Días | `cantidad_dias` | número | ✅ |
| Días Disponibles | `dias_disponibles` | número | ❌ |
| Días Utilizados | `dias_utilizados` | número | ❌ |
| Teléfono Emergencia | `telefono_emergencia` | texto | ❌ |
| Email Alternativo | `email_alternativo` | email | ❌ |
| Observaciones | `observaciones` | textarea | ❌ |
| Fecha Solicitud | `fecha_solicitud` | fecha (auto) | ✅ |

---

## Notas

- En Word, usá **exactamente** `{{nombre_variable}}` (con doble llave)
- Las variables son case-sensitive: `{{DNI}}` ≠ `{{dni}}`
- Docxtemplater reemplaza todo lo que esté entre `{{` y `}}`
