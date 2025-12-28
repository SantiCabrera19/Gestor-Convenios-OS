import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface CorrectionEmailData {
  userEmail: string
  userName: string
  convenioTitle: string
  convenioId: string | number
  typeSlug: string
  observaciones: string
  adminName: string
}

export async function sendCorrectionRequestEmail(data: CorrectionEmailData) {
  try {
    const { userEmail, userName, convenioTitle, convenioId, typeSlug, observaciones, adminName } = data

    const correctionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/protected/convenio-detalle/${convenioId}?type=${typeSlug}&mode=correccion`

    const { data: emailData, error } = await resend.emails.send({
      from: 'NexusDoc <onboarding@resend.dev>', // Cambiar por tu dominio verificado
      to: [userEmail],
      subject: `Solicitud de Corrección - Convenio: ${convenioTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #dc3545; margin: 0;">Solicitud de Corrección</h2>
          </div>
          
          <p>Hola <strong>${userName}</strong>,</p>
          
          <p>El administrador <strong>${adminName}</strong> ha solicitado correcciones en tu convenio:</p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">Convenio: ${convenioTitle}</h3>
            <p style="margin: 0; color: #856404;"><strong>Observaciones:</strong></p>
            <p style="margin: 10px 0 0 0; color: #856404;">${observaciones}</p>
          </div>
          
          <p>Para realizar las correcciones necesarias, haz clic en el siguiente enlace:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${correctionUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ir al Convenio
            </a>
          </div>
          
          <p style="color: #6c757d; font-size: 14px;">
            Si el enlace no funciona, copia y pega esta URL en tu navegador:<br>
            <a href="${correctionUrl}" style="color: #007bff;">${correctionUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="color: #6c757d; font-size: 12px; text-align: center;">
            Este es un email automático del sistema de NexusDoc.<br>
            No respondas a este mensaje.
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Error enviando email con Resend:', error)
      throw error
    }

    console.log('Email de corrección enviado exitosamente:', emailData)
    return emailData

  } catch (error) {
    console.error('Error en sendCorrectionRequestEmail:', error)
    throw error
  }
}

// ========== APPROVAL EMAIL ==========
interface ApprovalEmailData {
  userEmail: string
  userName: string
  convenioType: string
  convenioDate: string
}

export async function sendApprovalEmail(data: ApprovalEmailData) {
  try {
    const { userEmail, userName, convenioType, convenioDate } = data

    const { data: emailData, error } = await resend.emails.send({
      from: 'NexusDoc <onboarding@resend.dev>',
      to: [userEmail],
      subject: '✅ Tu Convenio Ha Sido Aprobado',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2ecc71; text-align: center;">✅ Tu Convenio Fue Aprobado</h2>
          
          <p>Hola <strong>${userName}</strong>,</p>
          
          <p>Nos complace informarte que tu convenio de tipo <strong>${convenioType}</strong>, enviado el <strong>${convenioDate}</strong>, ha sido <strong>ACEPTADO</strong>.</p>
          
          <p style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #2ecc71; border-radius: 4px;">
            Tu documentación está completa y cumple con todos los requisitos. Puedes acceder a tu perfil en la plataforma para ver más detalles.
          </p>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/protected" style="background-color: #2ecc71; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver en plataforma</a>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="color: #888; font-size: 12px; text-align: center;">Este es un correo automático de NexusDoc. No respondas directamente a este mensaje.</p>
        </div>
      `
    })

    if (error) {
      console.error('[Email] Error sending approval email:', error)
      throw error
    }

    console.log('[Email] Approval email sent:', emailData)
    return emailData
  } catch (error) {
    console.error('[Email] Error in sendApprovalEmail:', error)
    throw error
  }
}

// ========== REJECTION EMAIL ==========
interface RejectionEmailData {
  userEmail: string
  userName: string
  convenioType: string
  rejectionReason: string
  adminEmail: string
}

export async function sendRejectionEmail(data: RejectionEmailData) {
  try {
    const { userEmail, userName, convenioType, rejectionReason, adminEmail } = data

    const { data: emailData, error } = await resend.emails.send({
      from: 'NexusDoc <onboarding@resend.dev>',
      to: [userEmail],
      subject: '❌ Tu Convenio Ha Sido Rechazado',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #e74c3c; text-align: center;">❌ Tu Convenio Fue Rechazado</h2>
          
          <p>Hola <strong>${userName}</strong>,</p>
          
          <p>Lamentamos informarte que tu convenio de tipo <strong>${convenioType}</strong> ha sido <strong>RECHAZADO</strong>.</p>
          
          <div style="background-color: #fff5f5; padding: 15px; border-left: 4px solid #e74c3c; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #c0392b;"><strong>Motivo del rechazo:</strong></p>
            <p style="margin: 10px 0 0 0; color: #555;">${rejectionReason}</p>
          </div>
          
          <p>Si tienes preguntas sobre esta decisión, puedes contactar a <strong>${adminEmail}</strong>.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="color: #888; font-size: 12px; text-align: center;">Este es un correo automático de NexusDoc. No respondas directamente a este mensaje.</p>
        </div>
      `
    })

    if (error) {
      console.error('[Email] Error sending rejection email:', error)
      throw error
    }

    console.log('[Email] Rejection email sent:', emailData)
    return emailData
  } catch (error) {
    console.error('[Email] Error in sendRejectionEmail:', error)
    throw error
  }
}
