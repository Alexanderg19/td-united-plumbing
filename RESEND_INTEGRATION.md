# Integración de Resend — Notificaciones por Email

Resumen de lo implementado para que los formularios **Emergency**, **Schedule** y **Quote** envíen notificaciones por email usando [Resend](https://resend.com).

## Qué hace ahora cada formulario

Antes, los 3 formularios validaban campos y el reCAPTCHA, pero **no enviaban los datos a ningún lado** — solo simulaban un éxito en el navegador. Ahora, al enviar cualquiera de los 3:

1. El navegador manda los datos a `POST /api/leads`.
2. El servidor valida los campos otra vez (nunca hay que confiar solo en la validación del navegador — es fácil de saltarse con DevTools).
3. El servidor verifica el token de reCAPTCHA contra los servidores de Google.
4. Si todo pasa, se disparan **2 emails en paralelo** vía Resend:
   - Un email interno para el negocio, avisando que llegó un lead nuevo.
   - Un email de confirmación para el cliente que llenó el formulario.
5. El usuario ve la pantalla de éxito.

## Archivos nuevos

```
src/app/api/leads/route.ts          # el endpoint unificado que orquesta todo lo anterior
src/lib/env.ts                      # valida que existan RESEND_API_KEY, RESEND_FROM_EMAIL, etc.
src/lib/recaptcha.ts                # verifyRecaptcha() — extraído para reusarlo en /api/leads
src/lib/leads/types.ts              # tipos EmergencyLead | ScheduleLead | QuoteLead
src/lib/leads/validate.ts           # validación server-side con zod, por tipo de lead
src/lib/leads/notify-email.ts       # sendInternalEmail() y sendConfirmationEmail() vía Resend
src/emails/components/EmailLayout.tsx       # header/footer de marca compartido entre plantillas
src/emails/components/LeadDetailsTable.tsx  # tabla key/value reutilizable
src/emails/InternalLeadNotification.tsx     # plantilla del email al negocio (🚨/📅/💬 según tipo)
src/emails/CustomerConfirmation.tsx         # plantilla de confirmación al cliente, en inglés/español
.env.example                        # documenta todas las variables de entorno necesarias
```

Es **un solo endpoint** (`/api/leads`) parametrizado por un campo `type` (`emergency` | `schedule` | `quote`), en vez de 3 endpoints separados — así no se triplica la lógica de validación + reCAPTCHA + email.

## Archivos modificados

- **`src/app/api/verify-recaptcha/route.ts`** — ahora reutiliza `verifyRecaptcha()` de `src/lib/recaptcha.ts` en vez de tener la lógica duplicada. Este endpoint sigue existiendo pero ya no lo usa `EmergencyForm` (ahora llama a `/api/leads`, que hace la verificación de recaptcha + el envío de email en un solo paso).
- **`src/components/EmergencyForm/EmergencyForm.tsx`** — ahora llama a `/api/leads` en vez de solo a `/api/verify-recaptcha`. Recibe un nuevo prop `lang` para saber en qué idioma mandar el email de confirmación.
- **`src/components/ContactTabCard/ContactTabCard.tsx`** — los formularios de Schedule y Quote antes eran 100% client-side (ni siquiera llamaban al servidor). Ahora ambos llaman a `/api/leads`, con sus propios estados de "enviando…" y de error.
- **`src/components/Hero/Hero.tsx`** y **`src/app/[lang]/contact/page.tsx`** — pasan el prop `lang` hacia abajo a los formularios.
- **`src/dictionaries/en.json`** / **`es.json`** — se agregaron las llaves `errSubmit` (mensaje de error si falla el envío al servidor) y `btnSending` (texto del botón mientras se envía) en los 3 formularios.

## Manejo de errores

- Si la **validación de campos o el reCAPTCHA fallan** → se bloquea el envío y el usuario ve un mensaje de error (son recuperables: corregir un campo, reintentar el captcha).
- Si **el envío del email falla** (Resend caído, credenciales inválidas, etc.) → el usuario **igual ve la pantalla de éxito** (ya hizo su parte correctamente), pero el servidor loguea el error con el prefijo `[LEAD_DELIVERY_FAILURE]` junto con todos los datos del lead, para poder recuperarlo manualmente revisando los logs.

## Configuración de Resend (estado actual: modo de pruebas)

El `.env.local` está configurado así:

```
RESEND_API_KEY=re_...                                  # API key de una cuenta personal de Resend (dev)
RESEND_FROM_EMAIL=onboarding@resend.dev                # remitente de pruebas de Resend, sin dominio verificado
INTERNAL_NOTIFICATION_EMAIL=alexandercode.97@gmail.com # solo funciona el email del dueño de la API key
```

Esto es **modo de pruebas**: Resend solo permite enviar al email con el que te registraste, mientras no se verifique un dominio propio. Ya probamos el flujo completo end-to-end (formulario → validación → reCAPTCHA real → email) y funcionó correctamente.

### Antes de pasar a producción hay que:

1. Que el cliente (TD United Plumbing) cree su propia cuenta de Resend y verifique su dominio (agregar registros DNS que Resend indica).
2. Reemplazar en producción:
   - `RESEND_API_KEY` → la del cliente
   - `RESEND_FROM_EMAIL` → algo como `notificaciones@tdunitedplumbing.com`
   - `INTERNAL_NOTIFICATION_EMAIL` → el email real del negocio donde deben llegar los leads (puede ser una lista separada por comas)
3. Reemplazar los teléfonos/dirección placeholder (`(954) 555-0199`) que aparecen en `Footer.tsx` y en los formularios, por los datos reales del negocio.

Ver más contexto y comparación de proveedores de SMS (fase futura, no implementada todavía) en `docs/leads-notifications-plan.md`.
