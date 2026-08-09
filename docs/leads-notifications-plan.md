# Plan: Notificaciones por Email y SMS para los formularios (Emergency, Schedule, Quote)

## Contexto

Hoy los tres flujos de formulario (`EmergencyForm`, y `ContactTabCard` que contiene *Schedule* y *Quote*) validan campos y verifican reCAPTCHA, pero **ningún dato del formulario se envía a ningún lado**:

- `src/components/EmergencyForm/EmergencyForm.tsx` sí llama a `POST /api/verify-recaptcha`, pero al recibir `success: true` solo hace `setIsSuccess(true)` — nunca transmite `name/phone/type/address`.
- `src/components/ContactTabCard/ContactTabCard.tsx` (`handleScheduleSubmit` y `handleQuoteSubmit`) es **100% client-side**: ni siquiera llama a `/api/verify-recaptcha` en el servidor, solo revisa que el token no esté vacío. Es una brecha real — un bot puede saltarse el captcha porque no hay verificación server-side en estos dos formularios.

El único backend existente es `src/app/api/verify-recaptcha/route.ts` (proxy a la API de Google). No hay `resend`, `twilio`, ni ninguna librería de email/SMS en `package.json`. No hay persistencia (sin DB, sin `src/lib`). Las únicas env vars actuales son `RECAPTCHA_SECRET_KEY` y `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` en `.env.local` (no versionado, sin `.env.example`).

El objetivo de este documento es **la arquitectura técnica + el checklist de información/credenciales a solicitar al cliente**, para poder implementar en una sesión futura una vez el cliente responda.

---

## Arquitectura técnica recomendada (para la implementación futura)

### Endpoint unificado

Un solo route handler parametrizado por tipo, en vez de 3 endpoints separados (evita triplicar boilerplate de recaptcha + email + SMS y que diverjan con el tiempo):

```
src/app/api/leads/route.ts          # orquesta: valida → verifica recaptcha → envía email/SMS
src/lib/recaptcha.ts                # verifyRecaptcha(token) extraído de verify-recaptcha/route.ts
src/lib/leads/types.ts              # EmergencyLead | ScheduleLead | QuoteLead (discriminated union)
src/lib/leads/validate.ts           # validación server-side por tipo (zod) — nunca confiar solo en el cliente
src/lib/leads/notify-email.ts       # sendInternalEmail(lead), sendConfirmationEmail(lead) vía Resend
src/lib/leads/notify-sms.ts         # sendInternalSms(lead), sendConfirmationSms(lead) vía REST API del proveedor SMS
src/lib/env.ts                      # valida al boot que existan las env vars requeridas
.env.example                        # nuevo — documenta cada variable (hoy no existe)
```

El cliente (`EmergencyForm`, `ContactTabCard`) hace **un solo `POST /api/leads`** con `{ type, token, lang, ...campos }`. Para `EmergencyForm`, esto reemplaza la llamada actual a `/api/verify-recaptcha` (se consolida en una sola request, evitando el caso de "token de recaptcha ya consumido" al hacer dos llamadas separadas). Para `ContactTabCard`, se agrega el fetch que hoy no existe, más un estado `isSubmitting` para deshabilitar el botón durante el envío (Emergency ya lo tiene, ContactTabCard no).

### Paquetes nuevos

- **`resend`** — SDK oficial de Resend, soporta pasar un componente React directamente (`react: <Template/>`).
- **`@react-email/components`** — plantillas de email tipadas y reutilizables.
- **`zod`** — validación server-side del payload (la validación actual es solo client-side).
- **SMS: sin SDK pesado.** Se recomienda `fetch` directo a la REST API del proveedor elegido (Twilio, Vonage, AWS SNS, etc. — todas tienen una API HTTP simple con auth por header/Basic Auth). Aísla al proveedor detrás de `notify-sms.ts`; cambiar de proveedor después no toca el resto del código.

### Plantillas de email

```
src/emails/components/EmailLayout.tsx       # header/footer de marca compartido
src/emails/components/LeadDetailsTable.tsx  # tabla key/value genérica
src/emails/InternalLeadNotification.tsx     # email al negocio, parametrizado por leadType (asunto distinto: 🚨 emergencia / 📅 cita / 💬 cotización)
src/emails/CustomerConfirmation.tsx         # email de agradecimiento al cliente, localizado (en/es) según el `lang` de la URL
```

Un solo componente parametrizado por tipo en vez de 6 plantillas casi idénticas — reduce duplicación y mantiene el branding consistente.

### Manejo de errores (política recomendada)

- Si **recaptcha o validación de campos fallan** → sí bloquea, se devuelve error al usuario (son recuperables: reintentar captcha, corregir un campo).
- Si **el envío de email/SMS falla** (Resend o el proveedor SMS caído) → el usuario **igual ve éxito** (ya hizo su parte), pero se dispara una alerta de respaldo interna (email/SMS distinto a `LEADS_NOTIFY_ON_ERROR_EMAIL`) y se loguea el payload con un prefijo identificable (`[LEAD_DELIVERY_FAILURE]`) para recuperación manual. Los envíos de email/SMS corren en paralelo vía `Promise.allSettled`, nunca bloquean la respuesta HTTP de éxito.

### Persistencia

**Recomendación: solo email para el lanzamiento inicial**, sin base de datos ni hoja de cálculo todavía. El código se diseña con los "sinks" de notificación (email interno, SMS interno) como una lista independiente en `src/lib/leads/`, para que agregar Google Sheets/Airtable a futuro sea aditivo y no un rediseño, si el volumen de leads lo justifica más adelante.

### Variables de entorno nuevas (todas server-only, sin `NEXT_PUBLIC_`)

| Variable | Propósito |
|---|---|
| `RESEND_API_KEY` | Autenticación con Resend |
| `RESEND_FROM_EMAIL` | Remitente verificado (dominio verificado en Resend) |
| `INTERNAL_NOTIFICATION_EMAIL` | Destino del email interno de leads (puede ser lista separada por comas) |
| `SMS_PROVIDER_*` (credenciales según proveedor elegido) | Auth con la API REST del proveedor SMS |
| `SMS_FROM_NUMBER` | Número verificado desde el que se envían los SMS |
| `INTERNAL_ALERT_PHONE_NUMBER` | Número(s) del staff/dispatcher que reciben SMS de alerta |
| `ENABLE_CUSTOMER_SMS_CONFIRMATION` | Feature flag `true/false` — el cliente puede no querer el costo extra de SMS al cliente final desde el día 1 |
| `LEADS_NOTIFY_ON_ERROR_EMAIL` | Alerta técnica de respaldo si falla el envío de un lead |

---

## Comparación de proveedores de SMS

Todos requieren cumplir el mismo requisito de los carriers de EE.UU. (10DLC o Toll-Free) — esto **no es específico de un proveedor**, es una regla de la industria para SMS A2P (Application-to-Person) en números de EE.UU. Ningún proveedor evita este trámite.

| Proveedor | Precio aprox. (SMS saliente US) | Número | Trámite de compliance | Notas |
|---|---|---|---|---|
| **Twilio** | ~$0.0079/mensaje | ~$1.15/mes (long code) o ~$2/mes (toll-free) | 10DLC (brand ~$4 + campaña ~$1.50–10/mes, revisión 1–15 días hábiles) o Toll-Free Verification (más simple, ~2–5 días hábiles) | Estándar de la industria, mejor documentación, consola muy usada por agencias/freelancers, fácil de facturar por separado del cliente |
| **Vonage (ex-Nexmo)** | ~$0.0074/mensaje | similar a Twilio | Mismo requisito 10DLC para long codes en EE.UU. | API igual de simple (REST/HTTP), menos común pero igual de confiable |
| **AWS SNS** | ~$0.00645/mensaje | requiere origination identity (10DLC igual aplica desde 2023) | 10DLC también | Tiene sentido solo si el cliente ya usa AWS para otra cosa; agrega la complejidad de IAM/cuenta AWS si no la tienen, y por defecto las cuentas nuevas tienen límite de gasto bajo (hay que pedir aumento) |
| **MessageBird / Bird** | similar rango | similar | Mismo requisito en EE.UU. | Más orientado a mercado europeo; menos ventaja si el negocio es 100% EE.UU. |

**Recomendación a presentar al cliente:** Twilio, por ser el más documentado y el más fácil de soportar a largo plazo, con **Toll-Free Verification** en vez de 10DLC si el volumen de SMS es bajo (una plomería local probablemente envía pocas decenas de SMS/día) — es más rápido de aprobar y no tiene la cuota mensual de "campaña" del 10DLC. Si el cliente ya tiene una cuenta con otro proveedor (por ejemplo, si ya usa AWS para hosting), vale la pena preguntarlo antes de asumir Twilio.

---

## Checklist de información a solicitar al cliente

### Para Email (Resend)

1. ¿El cliente ya tiene una cuenta de Resend, o hay que crear una? — **recomendación: que el cliente cree y sea dueño de la cuenta/facturación**, y agregue al desarrollador como colaborador o comparta solo la API key, en vez de que la cuenta quede a nombre del desarrollador.
2. Acceso a la gestión DNS del dominio del negocio (o que su proveedor de dominio/hosting agregue los registros TXT/DKIM que pida Resend para verificar el dominio de envío).
3. Dirección "from" deseada (ej. `notificaciones@tdunitedplumbing.com`) y nombre para mostrar.
4. Email(s) de destino reales donde deben llegar los leads (¿solo el dueño? ¿un email de despacho/oficina? ¿varios?).
5. Confirmar que el plan gratuito de Resend (3,000 emails/mes, 100/día, 1 dominio verificado) es suficiente para el volumen esperado, o si conviene presupuestar el plan pago (~$20/mes por 50k) si esperan mucho tráfico.
6. Tono/copy deseado para el email de confirmación al cliente final (formal/casual) y si tienen logo/colores de marca para el template.
7. Teléfono y dirección reales del negocio — hoy `Footer.tsx` y `EmergencyForm.tsx` usan placeholders (`(954) 555-0199`) que hay que reemplazar.

### Para SMS

1. Confirmar proveedor (Twilio recomendado, o si el cliente ya usa otro servicio que prefiera).
2. Que el cliente cree la cuenta (misma lógica que Resend: que la facturación quede a su nombre) y comparta las credenciales de API.
3. Presupuesto aprobado para el costo recurrente por mensaje — a diferencia de Resend, **SMS no tiene un tier gratuito real para producción** (las cuentas trial de Twilio solo sirven para pruebas, con prefijo "trial" y restringidas a números verificados).
4. Número(s) de teléfono del staff/dispatcher que deben recibir la alerta SMS interna cuando entra un lead (especialmente para Emergency).
5. Decisión: ¿quieren además un SMS de confirmación al cliente final (ej. "Gracias por contactar a TD United Plumbing, te llamaremos pronto")? Esto duplica el costo por envío y requiere incluir el texto de opt-out ("responde STOP para no recibir más mensajes") por buenas prácticas, aunque al ser transaccional (resultado directo de una acción del propio usuario) no aplica como SMS de marketing.
6. Confirmar si quieren SMS solo para Emergency (más urgente) o también para Schedule/Quote.
7. Tiempo de espera esperado: el registro 10DLC/Toll-Free puede tardar de días a un par de semanas — importante comunicarlo para planear el go-live.

### General

1. ¿Alguno de los dos servicios (Resend/Twilio) ya existe en alguna cuenta de la empresa, o hay que crear todo desde cero?
2. Confirmar que no se requiere guardar los leads en una base de datos/CRM por ahora (email como registro es suficiente) — o si de entrada quieren algo tipo hoja de cálculo/Airtable para llevar seguimiento (afecta el alcance de la próxima fase).
3. Emails/teléfonos de prueba para hacer QA antes de activar en producción.

---

## Próximos pasos (secuencia sugerida)

1. Enviar al cliente el checklist de arriba (Email + SMS + General).
2. Cuando el cliente confirme proveedor de SMS y comparta credenciales de ambas cuentas, implementar `src/lib/leads/*`, `src/app/api/leads/route.ts`, plantillas de email, y conectar los `handleSubmit` de `EmergencyForm.tsx` y `ContactTabCard.tsx`.
3. Reemplazar los placeholders de teléfono/dirección (`Footer.tsx`, `EmergencyForm.tsx`) con los datos reales del negocio.
4. QA end-to-end con los emails/teléfonos de prueba antes de activar en producción.

## Verificación (cuando se implemente)

- Probar cada uno de los 3 formularios end-to-end en `npm run dev`, confirmando que: (a) el email interno llega con todos los campos correctos, (b) el email de confirmación llega al remitente del formulario, (c) el SMS interno llega al número de staff configurado, (d) el flujo de error (recaptcha inválido, campo faltante) sigue bloqueando como hoy.
- Simular un fallo del proveedor de email/SMS (ej. API key inválida temporalmente) y confirmar que el usuario sigue viendo la pantalla de éxito, y que la alerta de respaldo (`LEADS_NOTIFY_ON_ERROR_EMAIL`) se dispara.
