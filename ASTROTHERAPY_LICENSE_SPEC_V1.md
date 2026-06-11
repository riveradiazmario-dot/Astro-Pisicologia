ASTROTHERAPY LICENSE SPECIFICATION V1.0

Estado del Documento

Versión: 1.0

Fecha: Junio 2026

Estado: Aprobado para Implementación

Producto: AstroTherapy Pro / AstroTherapy Premium

⸻

Objetivo

Implementar un sistema profesional de autenticación, licenciamiento y suscripciones para AstroTherapy.

El sistema deberá permitir:

* Registro de usuarios.
* Inicio de sesión.
* Recuperación de contraseña.
* Validación de suscripciones.
* Control de dispositivos.
* Gestión de planes.
* Cuenta Founder permanente.
* Integración con Stripe.
* Integración con Supabase.
* Funcionamiento como aplicación de escritorio.

⸻

Tecnologías Definidas

Frontend

* React
* Vite
* TypeScript

Aplicación de Escritorio

* Electron

Base de Datos

* Supabase PostgreSQL

Autenticación

* Supabase Auth

Pagos

* Stripe

⸻

Productos Comerciales

AstroTherapy Pro

Mensual

Precio:

USD 19 / mes

Anual

Precio:

USD 190 / año

⸻

AstroTherapy Premium

Mensual

Precio:

USD 39 / mes

Anual

Precio:

USD 390 / año

⸻

Roles del Sistema

Founder

Propietario del software.


⸻

Pro

Características:

* Acceso a AstroTherapy Pro.
* Hasta 2 dispositivos.
* Requiere suscripción activa.

⸻

Premium

Características:

* Acceso a AstroTherapy Premium.
* Hasta 2 dispositivos.
* Requiere suscripción activa.

⸻

Estados de Suscripción

active

Suscripción activa.

Acceso permitido.

⸻

trial

Periodo de prueba.

Acceso permitido.

⸻

expired

Suscripción vencida.

Acceso bloqueado.

⸻

cancelled

Suscripción cancelada.

Acceso bloqueado.

⸻

founder

Cuenta especial.

Acceso permanente.

⸻

Tablas Requeridas

profiles

Campos:

* id
* email
* full_name
* role
* created_at

⸻

subscriptions

Campos:

* id
* user_id
* plan
* status
* stripe_customer_id
* stripe_subscription_id
* expires_at
* created_at

⸻

devices

Campos:

* id
* user_id
* device_id
* device_name
* last_login
* created_at

⸻

Control de Dispositivos

Pro

Máximo:

2 dispositivos

⸻

Premium

Máximo:

2 dispositivos

⸻

Founder

Máximo:

5 dispositivos

⸻

Comportamiento al Exceder el Límite

Si el usuario intenta activar un tercer dispositivo:

Mostrar mensaje:

“Has alcanzado el límite de dispositivos permitidos.”

Permitir:

* Ver dispositivos registrados.
* Seleccionar dispositivo a reemplazar.
* Registrar nuevo dispositivo.

⸻

Flujo de Inicio de Aplicación

Al abrir AstroTherapy:

1. Verificar sesión activa.
2. Si no existe sesión:
    * Mostrar Login.
3. Si existe sesión:
    * Consultar suscripción.
4. Validar estado.
5. Validar dispositivos.
6. Abrir aplicación.

⸻

Flujo de Registro

1. Usuario crea cuenta.
2. Supabase Auth crea usuario.
3. Se genera registro en profiles.
4. Estado inicial:
    * trial o pending_payment.

⸻

Flujo de Recuperación de Contraseña

Utilizar mecanismo nativo de Supabase Auth.

⸻

Flujo Stripe

1. Usuario selecciona plan.
2. Stripe procesa pago.
3. Webhook recibe confirmación.
4. Actualizar subscriptions.
5. Activar acceso.

⸻

Renovaciones

Stripe actualizará automáticamente:

* Estado.
* Fecha de expiración.
* Renovaciones.

⸻

Cancelaciones

Si una suscripción es cancelada:

* Mantener acceso hasta expires_at.
* Después cambiar a expired.

⸻

Seguridad

Nunca almacenar

* Contraseñas.
* Tokens Stripe.
* Service Role Key.

en frontend.

⸻

# Variables Sensibles

Mantener fuera de GitHub:

* SUPABASE_SERVICE_ROLE_KEY
* STRIPE_SECRET_KEY

⸻

# Empaquetado

Windows

Archivo esperado:

AstroTherapy-Pro-Setup.exe


macOS

Archivo esperado:

AstroTherapy-Pro.dmg


# Funciones Futuras

Versión 1.1

* Gestión de dispositivos desde panel web.
* Suspensión manual de licencias.
* Licencias temporales.


Versión 1.2

* Panel administrativo.
* Métricas de uso.
* Gestión avanzada de usuarios.


# Cuenta Founder

Las cuentas Founder son administradas exclusivamente por el propietario del software.

Características:

- Acceso permanente.
- Sin vencimiento.
- No requieren suscripción Stripe.
- Acceso completo a AstroTherapy Pro.
- Acceso completo a AstroTherapy Premium.
- Hasta 5 dispositivos autorizados.
- Pueden utilizar funciones de prueba y demostración.
- Pueden acceder a funcionalidades administrativas.

Las cuentas Founder deberán ser creadas manualmente por el propietario o mediante herramientas administrativas internas.

Las cuentas Founder no podrán ser creadas mediante registro público.

# Política de Validación

La aplicación validará:

- Inicio de sesión.
- Estado de suscripción.
- Dispositivos autorizados.

Frecuencia:

- Al iniciar la aplicación.
- Cada 24 horas durante el uso normal.

Si el usuario pierde conexión temporalmente:

- Mantendrá acceso durante 7 días.
- La aplicación solicitará una nueva validación cuando exista conexión disponible.

Si la validación falla después del período de gracia:

- El acceso será restringido hasta realizar una validación exitosa.

Identificación de Dispositivos

Cada instalación deberá generar un Device ID único.

Este identificador será utilizado para:

- Control de licencias.
- Control de dispositivos autorizados.
- Reemplazo de dispositivos.
- Auditoría de accesos.

El Device ID no deberá ser modificable por el usuario.

# Respaldo de Datos

Las cuentas deberán almacenar la información crítica en Supabase.

La pérdida de un equipo no deberá provocar la pérdida de:

- Cuenta de usuario.
- Licencia.
- Historial de suscripción.
- Configuración de acceso.

Las funcionalidades específicas de respaldo de notas, consultantes y sesiones serán definidas en una versión posterior.

# Comparativa de Planes

| Funcionalidad | Pro | Premium |
|---------------|-----|----------|
| Carta Natal | ✅ | ✅ |
| Posiciones Planetarias | ✅ | ✅ |
| Casas Astrológicas | ✅ | ✅ |
| Aspectos Principales | ✅ | ✅ |
| Interpretaciones Terapéuticas | ✅ | ✅ |
| Informes Profesionales | ✅ | ✅ |
| Interpretaciones IA | ❌ | ✅ |
| Análisis Kármico Avanzado | ❌ | ✅ |
| Aspectos Activos | ❌ | ✅ |
| Notas Terapéuticas | ❌ | ✅ |
| Seguimiento de Sesiones | ❌ | ✅ |
| Dispositivos Permitidos | 2 | 2 |

# Decisiones Cerradas

Estas decisiones NO deberán ser modificadas sin aprobación explícita:

* Aplicación de escritorio.
* Electron.
* Supabase.
* Stripe.
* Máximo 2 dispositivos para clientes.
* Cuenta Founder permanente.
* Suscripciones mensuales y anuales.
* Validación online.
* AstroTherapy Pro USD 19 / USD 190.
* AstroTherapy Premium USD 39 / USD 390.
* Founder con acceso a Pro y Premium.
* Founder con hasta 5 dispositivos.