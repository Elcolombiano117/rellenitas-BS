# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a47a79b9-8f84-4efd-a203-b1c7fc109eae

## 🍪 Sistema de Estados de Pedidos

Este proyecto incluye un **Sistema de Kitchen Display (KDS)** con seguimiento en tiempo real de pedidos.

### Estados del Pedido

Los pedidos pasan por los siguientes estados:

1. **Pendiente** 🟡
   - El pedido ha sido recibido y está en cola
   - Personal de cocina puede tocarlo para marcar como "En Preparación"

2. **En Preparación** 🔵
   - El chef está preparando la Rellenita
   - Personal puede tocarlo para marcar como "Listo"

3. **Listo para Entrega/Recogida** 🟢
   - El pedido está empacado y listo
   - Personal puede tocarlo para marcar como "En Entrega"

4. **En Entrega** 🟣
   - El repartidor está llevando el pedido
   - Personal puede tocarlo para marcar como "Entregado"

5. **Entregado** ✅
   - El pedido fue entregado exitosamente al cliente

### Páginas del Sistema

- **`/cocina` o `/kitchen`**: Pantalla de Cocina (KDS) para el personal
  - Muestra todos los pedidos pendientes, en preparación, listos y en entrega
  - Click en cualquier tarjeta para avanzar al siguiente estado
  - Actualización en tiempo real con Supabase Realtime
  - Notificación sonora cuando llega un nuevo pedido

- **`/seguimiento/:orderId` o `/tracking/:orderId`**: Página de seguimiento para clientes
  - Muestra el estado actual del pedido en tiempo real
  - Actualización automática cuando el estado cambia en el KDS
  - Animaciones y mensajes personalizados por cada estado
  - Incluye mapa cuando el pedido está en entrega

- **`/` (Inicio)**: Página principal con sección de rastreo
  - Los clientes pueden ingresar su número de pedido
  - Busca y redirige a la página de seguimiento

### Características Técnicas

- ✅ **Real-time Updates**: Los cambios de estado se reflejan instantáneamente usando Supabase Realtime
- ✅ **Historial de Estados**: Cada cambio se registra en `order_status_history`
- ✅ **Notificaciones**: Sonido de alerta cuando llega un nuevo pedido
- ✅ **Responsive Design**: Funciona en tablets, móviles y pantallas grandes
- ✅ **Touch-Friendly**: Interfaz táctil optimizada para uso en cocina

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a47a79b9-8f84-4efd-a203-b1c7fc109eae) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a47a79b9-8f84-4efd-a203-b1c7fc109eae) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
