---
version: 1
slug: "apps-dashboard-src-views-chat-view-tsx"
primary_target: "apps/dashboard/src/views/chat-view.tsx"
related_targets: ["apps/dashboard/src/app/app.tsx","apps/dashboard/src/views/audit-view.tsx","apps/landing/src/layouts/AuthLayout.astro"]
---

# Surface brief — dashboard chat (Operate) + landing auth

Scope: apps/dashboard chat-view + app shell + audit-view; apps/landing AuthLayout + login/register. Mode: Operate.
Audience/job: equipos que chatean a diario con IA multi-modelo; admins que auditan. Acción: continuar una sesión en segundos, cambiar de modelo, enviar. Landing: entrar/registrarse y llegar al dashboard.
Constraints: solo visual — mismos componentes, props, llamadas Convex/apps/api, mismo flujo #token. Nada simulado. Audit read-only.

## Direction contract

THESIS: Smith Console — el clon funcional de Claude que este equipo necesitaba: sidebar de sesiones a la izquierda, hilo central, cambio de modelo como pill en el header. Rehúsa la consola genérica gris-azul wireframe y cualquier gesto marketing dentro de la app.

OWN-WORLD: Papel marfil cálido #F7F5F0 en sidebar, blanco #FFFFFF en hilo, tinta #1A1917, un solo acento terracota contenido #C15F3C solo para selección/primario/estado. Una sans workhorse, escala 1.125, numerales tabulares. Bordes hairline, radio 10-14px, sombras con offset+blur. Sin serif display, sin neón, sin kickers.

STORY: El usuario abre y ve sus sesiones con título+modelo+preview, salta con ⌘K/búsqueda, abre una y el header muestra la pill de modelo; envía desde el composer píldora. El admin pasa a auditoría en el mismo shell. El visitante de landing ve el mismo lenguaje y entra.

FIRST VIEWPORT: Sidebar 280px — marca Smith, botón New chat, búsqueda, lista de sesiones (activa con fondo acento tenue), identidad abajo. Centro max 48rem — header con título + pill segmentada GPT-4o/Claude 3.5/Gemini, hilo de burbujas asimétricas, composer píldora con foco en anillo acento y botón Send. Audit: mismo shell, 3 columnas usuarios→conversaciones→lector.

FORM: Candidato propio nº5 (consola ops densa + ergonomía Claude), seed 86019a4d. Raises donadas: quiet front plane (cracktro); tabular numerals + un acento (nixie); rojo solo-error (anime); one-message-per-row + acciones al borde (airport, competitive); empty→active wash (cyclorama); bloques apilados con gaps (cloud-quarry).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
