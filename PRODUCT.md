# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Equipos que trabajan con IA multi-modelo en sesiones persistentes diarias, y admins que auditan uso. El usuario primario abre el dashboard para continuar una sesión, cambiar de modelo y enviar mensajes; el admin alterna a auditoría para revisar usuarios, conversaciones y mensajes.

## Product Purpose

Smith — SaaS de chat multi-modelo con sesiones persistentes. Permite crear, continuar y organizar conversaciones, cambiar de modelo por conversación (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) y leer historial. Éxito = volver a la sesión correcta en segundos y enviar sin fricción. Landing porta login/registro y redirige con sesión al dashboard.

## Positioning

Conversaciones propias aisladas por `ownerUserId` directo a Convex, sin pasar chat por apps/api; auditoría admin read-only vía apps/api con gate de rol server-side. v1 con provider deferred: selector persiste, sin inferencia simulada.

## Operating Context

Flujos: landing login/register → `#token=...` → dashboard consume token, valida en Strapi `/api/users/me`, resuelve rol vía `getMe`, rutea chat vs audit. Chat: lista propia, crear, seleccionar, enviar, cambiar modelId. Audit: usuarios → conversaciones → mensajes. Entornos: dashboard React+Vite, landing Astro, Convex persistencia, Strapi sesiones.

## Capabilities and Constraints

Confirmado: auth Strapi por token en localStorage, roles user/admin, Convex `listOwnConversations/listMessages/createConversation/sendMessage/updateModelId`, audit `listAuditUsers/listUserConversations/listConversationMessages`, estados loading/unauthorized/unavailable, empty-send bloqueado, provider-deferred estático no persistido.
Restricción del rediseño: solo visual — misma funcionalidad, mismos endpoints, mismos contratos. No manejar credenciales en dashboard, no inventar inferencia, no mutaciones en audit.
Undecided: pricing, límites, nombres finales de planes.

## Brand Commitments

Nombre Smith. Sin logo/voz consolidados — el rediseño define el sistema sin romper contenido ni funciones. Referencia explícita del usuario: UI similar a Claude — sesiones a la izquierda, chat central, cambio de modelos.

## Evidence on Hand

- `apps/dashboard/src/views/chat-view.tsx` — layout sidebar + chat-pane + composer actuales
- `apps/dashboard/src/views/audit-view.tsx` — layout 3 columnas read-only
- `apps/dashboard/src/app/app.tsx` — shell topbar + routing chat/audit
- `apps/dashboard/src/lib/chat.ts` — MODEL_OPTIONS, DEFAULT_MODEL_ID, PROVIDER_DEFERRED_TEXT
- `apps/dashboard/src/styles.css`, `apps/dashboard/src/app/app.module.css` — sistema visual incumbent (wireframe gris/azul)
- `apps/landing/src/pages/login.astro`, `register.astro` — entrada auth
- Sin testimonios, métricas ni assets finales — no fabricarlos.

## Product Principles

1. La sesión manda: continuar es más rápido que crear.
2. Un modelo por conversación, cambio explícito y visible.
3. Nada simulado: si no hay provider, se dice sin inventar.
4. Admin separado: auditar no interfiere con chatear.
5. Consistencia SaaS: dashboard y landing hablan el mismo lenguaje.

## Accessibility & Inclusion

Web operativa diaria: foco visible, navegación por teclado en sidebar/chat/composer, contraste AA, `role=status/alert` en vacíos y errores ya existentes — preservar y elevar.
