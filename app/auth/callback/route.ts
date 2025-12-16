import { createClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect = requestUrl.searchParams.get("redirect");
  
  if (code) {
    const supabase = await createClient();
    
    // Intercambiar el código de OAuth por una sesión
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      const { session } = data;
      // Intentar extraer tokens del proveedor (Google)
      const providerToken = session.provider_token;
      const providerRefreshToken = session.provider_refresh_token;
      
      if (providerToken) {
        console.log('✅ [Auth Callback] Tokens de Google recibidos. Guardando...');
        
        // Calcular expiración (aprox 1 hora por defecto en Google)
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + 3590); // 1 hora menos 10 segs
        
        const tokenData: any = {
          user_id: session.user.id,
          access_token: providerToken,
          updated_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        };

        // Solo actualizamos el refresh token si viene uno nuevo (Google no siempre lo manda)
        if (providerRefreshToken) {
          tokenData.refresh_token = providerRefreshToken;
        }

        // Guardar en la tabla personalizada para uso offline (Drive API)
        const { error: upsertError } = await supabase
          .from('google_oauth_tokens')
          .upsert(tokenData, { onConflict: 'user_id' });
          
        if (upsertError) {
          console.error('❌ [Auth Callback] Error guardando tokens de Google:', upsertError);
        } else {
          console.log('✅ [Auth Callback] Tokens de Google guardados exitosamente.');
        }
      } else {
        console.warn('⚠️ [Auth Callback] No se recibieron tokens de proveedor (Google).');
      }
    }
  }

  // Redirigir a la URL original o a protected por defecto
  const redirectUrl = redirect && redirect.startsWith('/protected') ? redirect : "/protected";
  return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
}
