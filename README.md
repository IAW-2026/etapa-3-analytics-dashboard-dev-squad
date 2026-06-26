# Analytics Dashboard — Zapasya

**Producción:** [https://etapa-3-analytics-dashboard-dev-squ.vercel.app](https://etapa-3-analytics-dashboard-dev-squ.vercel.app)

---

## Usuarios de prueba

La aplicación utiliza **Clerk** para autenticación. Para ingresar al dashboard, puedes registrarte o iniciar sesión con cualquier cuenta de correo electrónico válida, es decir, que esté asociada a un rol de administrador. 
## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin+clerk_test@iaw.com | iawuser# |

---

## Instrucciones de uso

1.  Ingresar a la URL de producción.
2.  Crear una cuenta o iniciar sesión mediante Clerk (correo electrónico y contraseña).
3.  Navegar por las secciones del menú lateral:
    - **Dashboard** — Órdenes de compra con filtros por estado (PENDING, PAID, SHIPPED, DELIVERED) y paginación.
    - **Analytics** — Métricas de reseñas (distribución de puntuaciones, tendencia mensual, productos y vendedores destacados, reseñas recientes).
    - **Seller** — KPIs de vendedores y productos (ingresos, ventas totales, top sellers y productos).
    - **Payments** — Estadísticas de pagos (montos procesados, transacciones rechazadas, disputas).
    - **Shipping** — Métricas de envíos (embudo de estados, tendencia mensual, comparativa por correo, costos, envíos estancados, destinos principales).

Para ejecutar localmente:

```bash
npm install
cp .env.example .env.local   # Completar con las variables reales
npm run dev                   # http://localhost:3000
```

---

## Descripción del proyecto

**Analytics Dashboard** es un panel de administración centralizado para **Zapasya**, un e-commerce de zapatillas. El dashboard consume datos de cinco microservicios independientes —Buyer App, Feedback, Seller App, Payments y Shipping— y los unifica en una única interfaz web para facilitar el monitoreo y la toma de decisiones.

Cada sección del dashboard está diseñada como un módulo independiente que se comunica con su microservicio correspondiente mediante APIs autenticadas por API key.

---

## Fortalezas de la App

-   **Estados de carga y error:** Cada sección del dashboard cuenta con su propio `loading.tsx` (skeleton/spinner) y `error.tsx` (mensaje de error con botón de reintento), siguiendo las convenciones de Next.js App Router.
-   **Responsive:** El menú lateral se colapsa en pantallas chicas con un toggle de hamburguesa. Los gráficos y tablas se adaptan al ancho disponible.
-   **Manejo de datos faltantes:** Los componentes cliente validan la respuesta de la API antes de renderizar. Si un microservicio no responde o devuelve datos vacíos, se muestran valores por defecto (0, array vacío, etc.) en lugar de romper la interfaz.
-   **Tema oscuro:** Se implementó con un `ThemeProvider` que persiste la preferencia en `localStorage` y respeta la preferencia del sistema (`prefers-color-scheme`) en la primera visita.
