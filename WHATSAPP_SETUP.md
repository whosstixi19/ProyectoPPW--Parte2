# Configuración de WhatsApp con Twilio

## Estado Actual
❌ **WhatsApp está deshabilitado** - La funcionalidad no causará errores pero no enviará mensajes.

## Habilitar WhatsApp

### 1. Configurar Firebase Functions

Los secretos de Twilio deben estar configurados en Firebase:

```bash
cd functions
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN  
firebase functions:secrets:set TWILIO_WHATSAPP_FROM
```

### 2. Desplegar Functions

```bash
firebase deploy --only functions
```

### 3. Habilitar en el Frontend

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  // ... otras configuraciones
  whatsappEnabled: true, // Cambiar de false a true
  // ... resto del código
};
```

### 4. Verificar Funcionamiento

Una vez habilitado:

1. Los programadores verán el modal de configuración de WhatsApp al iniciar sesión
2. Podrán agregar su número de teléfono
3. Recibirán notificaciones por WhatsApp cuando haya nuevas asesorías

## Desactivar WhatsApp

Para desactivar temporalmente WhatsApp (sin romper nada):

1. Cambiar `whatsappEnabled: false` en `environment.ts`
2. Recompilar la aplicación

La aplicación funcionará normalmente solo con notificaciones por email.

## Estructura de Archivos

- `/functions/index.js` - Función de Firebase para enviar WhatsApp
- `/functions/package.json` - Dependencias (incluye Twilio SDK)
- `/src/environments/environment.ts` - Configuración de habilitación
- `/src/app/services/notification.service.ts` - Servicio de notificaciones
- `/src/app/components/whatsapp-setup-modal/` - Modal de configuración

## Notas

- **Sin configuración**: La app funciona normalmente, solo sin WhatsApp
- **Email siempre funciona**: Las notificaciones por email están separadas
- **No hay errores**: Si WhatsApp está deshabilitado, se ignora silenciosamente
