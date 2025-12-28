import { createClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";
import { moveFileToFolder, moveFileToFolderOAuth, moveFolderToFolderOAuth, DRIVE_FOLDERS } from '@/infrastructure/google-drive/client';
import { NotificationService } from '@/shared/services/notification-service';
import { sendApprovalEmail, sendRejectionEmail, sendCorrectionRequestEmail } from '@/shared/services/email-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Verificar si el usuario es admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener la acción y datos del body
    const { action } = await request.json();

    // Obtener el convenio actual con tipo
    const { data: convenio } = await supabase
      .from("convenios")
      .select("status, user_id, document_path, title, convenio_type_id")
      .eq("id", params.id)
      .single();

    if (!convenio) {
      return NextResponse.json(
        { error: "Convenio no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el archivo/carpeta existe en Drive antes de aprobar
    if (action === "approve") {
      if (!convenio.document_path) {
        return NextResponse.json(
          { error: "No se puede aprobar el convenio porque no se encontró el archivo en Drive" },
          { status: 400 }
        );
      }

      // Detectar si es convenio específico (carpeta) o archivo normal
      const isConvenioEspecifico = convenio.convenio_type_id === 4;
      let itemId = null;

      if (isConvenioEspecifico) {
        // Para convenio específico, extraer ID de carpeta
        itemId = convenio.document_path.split('/folders/')[1]?.split('?')[0];
      } else {
        // Para otros tipos, extraer ID de archivo
        itemId = convenio.document_path.split('/d/')[1]?.split('/')[0];
      }

      if (!itemId) {
        return NextResponse.json(
          { error: "No se puede aprobar el convenio porque el ID del archivo no es válido" },
          { status: 400 }
        );
      }

      try {
        // Usar función apropiada según el tipo
        if (isConvenioEspecifico) {
          console.log('📁 [Admin] Moviendo carpeta de convenio específico...');
          await moveFolderToFolderOAuth(itemId, DRIVE_FOLDERS.APPROVED);
        } else {
          console.log('📄 [Admin] Moviendo archivo de convenio normal...');
          await moveFileToFolderOAuth(itemId, DRIVE_FOLDERS.APPROVED);
        }
      } catch (driveError) {
        console.error("Error al mover el archivo/carpeta en Drive:", driveError);
        return NextResponse.json(
          { error: "No se puede aprobar el convenio porque no se pudo acceder al archivo en Drive" },
          { status: 400 }
        );
      }
    }

    let newStatus: string;
    let actionDetails: string;
    let targetFolderId: string | null = null;

    switch (action) {
      case "approve":
        newStatus = "aprobado";
        actionDetails = "Convenio aprobado";
        targetFolderId = DRIVE_FOLDERS.APPROVED;
        break;
      case "reject":
        newStatus = "rechazado";
        actionDetails = "Convenio rechazado";
        targetFolderId = DRIVE_FOLDERS.REJECTED;
        break;
      case "correct":
        newStatus = "revision";
        actionDetails = "Corrección solicitada";
        targetFolderId = DRIVE_FOLDERS.ARCHIVED;
        break;
      case "archive":
        newStatus = "archivado";
        actionDetails = "Convenio archivado";
        targetFolderId = DRIVE_FOLDERS.ARCHIVED;
        break;
      default:
        return NextResponse.json(
          { error: "Acción no válida" },
          { status: 400 }
        );
    }

    // Actualizar el estado del convenio
    const { error: updateError } = await supabase
      .from("convenios")
      .update({
        status: newStatus,
        reviewer_id: user.id,
        ...(action === "approve" && { approved_at: new Date().toISOString() })
      })
      .eq("id", params.id);

    if (updateError) {
      console.error("Error al actualizar el convenio:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar el convenio" },
        { status: 500 }
      );
    }

    // Mover el archivo/carpeta en Drive si tenemos el ID
    if (targetFolderId && convenio.document_path) {
      try {
        // Detectar si es convenio específico (carpeta) o archivo normal
        const isConvenioEspecifico = convenio.convenio_type_id === 4;
        let itemId = null;

        if (isConvenioEspecifico) {
          // Para convenio específico, extraer ID de carpeta
          itemId = convenio.document_path.split('/folders/')[1]?.split('?')[0];
        } else {
          // Para otros tipos, extraer ID de archivo
          itemId = convenio.document_path.split('/d/')[1]?.split('/')[0];
        }

        if (itemId) {
          // Usar función apropiada según el tipo
          if (isConvenioEspecifico) {
            console.log(`📁 [Admin] Moviendo carpeta de convenio específico a ${targetFolderId}...`);
            await moveFolderToFolderOAuth(itemId, targetFolderId);
          } else {
            console.log(`📄 [Admin] Moviendo archivo de convenio normal a ${targetFolderId}...`);
            await moveFileToFolderOAuth(itemId, targetFolderId);
          }
        }
      } catch (driveError) {
        console.error("Error al mover el archivo/carpeta en Drive:", driveError);
        // No fallamos si el movimiento en Drive falla
      }
    }

    // Registrar la actividad
    const { error: activityError } = await supabase
      .from("activity_log")
      .insert({
        convenio_id: params.id,
        user_id: user.id,
        action: action,
        status_from: convenio.status,
        status_to: newStatus,
        metadata: {},
        ip_address: request.headers.get("x-forwarded-for") || "unknown"
      });

    if (activityError) {
      console.error("Error al registrar la actividad:", activityError);
    }

    // Enviar notificación interna + email al usuario
    try {
      const convenioTitle = convenio.title || "Sin título";
      console.log('[Actions] 📧 Iniciando notificación/email para acción:', action);

      // Obtener datos del usuario para enviar email
      // El email está en auth.users, no en profiles
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", convenio.user_id)
        .single();

      // Obtener email del usuario usando admin auth API
      const { createClient: createAdminClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(convenio.user_id);

      const userEmail = authUser?.user?.email;
      const userName = userProfile?.full_name || authUser?.user?.user_metadata?.full_name || 'Usuario';

      console.log('[Actions] 👤 User name:', userName);
      console.log('[Actions] 📬 User email:', userEmail || 'NO EMAIL FOUND');
      if (authError) console.log('[Actions] ⚠️ Auth error:', authError.message);

      // Obtener tipo de convenio para el email
      const { data: convenioType } = await supabase
        .from("convenio_types")
        .select("name")
        .eq("id", convenio.convenio_type_id)
        .single();

      switch (action) {
        case "approve":
          // Notificación interna
          await NotificationService.convenioApproved(convenio.user_id, convenioTitle, params.id);
          // Email
          if (userEmail) {
            await sendApprovalEmail({
              userEmail: userEmail,
              userName: userName,
              convenioType: convenioType?.name || 'Convenio',
              convenioDate: new Date().toLocaleDateString('es-ES'),
            });
            console.log('[Actions] ✅ Approval email sent to:', userEmail);
          } else {
            console.log('[Actions] ⚠️ No email found for user, skipping email notification');
          }
          break;

        case "reject":
          // Notificación interna
          await NotificationService.convenioRejected(convenio.user_id, convenioTitle, params.id);
          // Email
          if (userEmail) {
            await sendRejectionEmail({
              userEmail: userEmail,
              userName: userName,
              convenioType: convenioType?.name || 'Convenio',
              rejectionReason: 'Documentación incompleta o no cumple con los requisitos.',
              adminEmail: 'admin@documentosos.com',
            });
            console.log('[Actions] ✅ Rejection email sent to:', userEmail);
          } else {
            console.log('[Actions] ⚠️ No email found for user, skipping email notification');
          }
          break;

        case "correct":
          // Notificación interna
          await NotificationService.convenioSentToCorrection(convenio.user_id, convenioTitle, params.id);
          // Email con link directo
          if (userEmail) {
            await sendCorrectionRequestEmail({
              userEmail: userEmail,
              userName: userName,
              convenioTitle: convenioTitle,
              convenioId: params.id,
              typeSlug: convenioType?.name?.toLowerCase().replace(/\s+/g, '-') || 'convenio',
              observaciones: 'Por favor revisa y corrige la documentación enviada.',
              adminName: user.email || 'Administrador',
            });
            console.log('[Actions] ✅ Correction email sent to:', userEmail);
          } else {
            console.log('[Actions] ⚠️ No email found for user, skipping email notification');
          }
          break;
      }
    } catch (notificationError) {
      console.error("[Actions] Error al enviar notificación/email:", notificationError);
      // No fallamos si la notificación/email falla
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 