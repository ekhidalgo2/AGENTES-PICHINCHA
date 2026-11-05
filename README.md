# Mapio by MHCONSULTANCY

Aplicación para levantar procesos AS-IS y preparar borradores A3 con evidencia trazable. El diseño y el alcance de la versión 1 están en [`docs/superpowers/specs/2026-10-27-levantamiento-as-is-pwa-design.md`](docs/superpowers/specs/2026-10-27-levantamiento-as-is-pwa-design.md); la secuencia de implementación está en [`docs/superpowers/plans/2026-10-27-levantamiento-as-is-pwa.md`](docs/superpowers/plans/2026-10-27-levantamiento-as-is-pwa.md).

## Requisitos

- Node.js 24 y npm.
- PostgreSQL administrado para desarrollo integrado y producción.
- Un archivo APQC PCF autorizado para la organización antes de cargar taxonomía. El libro del toolkit contiene referencias y ejemplos, no una taxonomía oficial completa.

## Inicio local

1. Instala dependencias con `npm ci`.
2. Copia `.env.example` a `.env` y configura `DATABASE_URL`, un `CSRF_SECRET` aleatorio y, si corresponde, el CIDR de `TRUSTED_PROXY`.
3. Ejecuta las migraciones locales con `npm run db:migrate`.
4. Inicia la interfaz con `npm run dev` y la API en otra terminal con `npm run server:dev`.

No uses secretos de producción en desarrollo. La PWA no debe recibir credenciales de proveedores de IA ni almacenar claves en el navegador.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Interfaz Vite |
| `npm run server:dev` | API Fastify con recarga |
| `npm run build` | Genera Prisma Client y compila la interfaz |
| `npm test -- --run` | Pruebas unitarias e integración de migraciones |
| `npm run test:e2e` | Pruebas de navegador Playwright |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificación de TypeScript |
| `npm run db:generate` | Genera el cliente de Prisma |
| `npm run db:migrate` | Migraciones para desarrollo |
| `npm run db:deploy` | Aplica migraciones existentes |

## Inicialización de la organización

Después de aplicar la migración inicial, el administrador técnico crea la organización y su primer administrador con un comando de una sola vez. No se crea una contraseña local; la autenticación corporativa se implementará mediante Workspace OIDC.

```sh
ORG_NAME='MHCONSULTANCY' \
FIRST_ADMIN_EMAIL='admin@example.com' \
FIRST_ADMIN_NAME='Administrador inicial' \
FIRST_ADMIN_ANALYST_PROFILE='diagrammer' \
npm run db:seed:organization
```

La taxonomía no incorpora códigos ni nombres inventados. Cuando se disponga del archivo autorizado, conviértelo a JSON con `source`, `version` y `categories` (`code`, `name`, `level`) y cárgalo indicando `TAXONOMY_ORGANIZATION_ID` y `APQC_TAXONOMY_FILE` al ejecutar `npm run db:seed:taxonomy`.

## Seguridad y datos

- Las rutas mutables exigen un token CSRF firmado y la API aplica límites de intentos a autenticación.
- Las cookies de sesión son `HttpOnly`, `Secure` y `SameSite=Lax`; HSTS se activa cuando Fastify recibe una conexión HTTPS directa o desde un proxy explícitamente confiable.
- La política CSP restringe scripts, estilos, fuentes, conexiones y recursos al mismo origen.
- Los eventos de auditoría omiten contenido y el esquema bloquea `UPDATE` y `DELETE`.
- La aplicación debe distinguir el origen de datos, validar permisos por organización/proyecto y no enviar evidencia a proveedores sin las compuertas definidas en el diseño.
- El límite de autenticación usa almacenamiento en memoria; una instalación con varias réplicas debe conectarlo a un almacén compartido antes de exponerla.

La interfaz actual es el cascarón inicial de Task 1; los flujos funcionales se implementan en las tareas siguientes del plan.