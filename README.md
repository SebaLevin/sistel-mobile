# sistel-mobile

Aplicación móvil **sistel-mobile** (Expo / React Native) para login, búsqueda de productos y gestión de stock. Se conecta al backend **sisteMobile**, que a su vez usa una base de datos SQL Server.

## ¿Qué es este proyecto?

- **App móvil** multiplataforma (Android / iOS) con Expo.
- **Pantallas:** inicio de sesión, búsqueda y detalle de producto (consulta y actualización de stock).
- **Configuración del servidor** desde la propia app: IP o dominio y puerto del backend (guardado en el dispositivo).

Para que la app funcione, el backend **sisteMobile** debe estar corriendo y accesible en la red (misma Wi‑Fi o dominio público). Ver el README del backend para configurarlo.

---

## Requisitos

- **Node.js** 18 o superior
- **Expo CLI** (se instala con las dependencias del proyecto)
- **Backend sisteMobile** en ejecución y accesible desde la red donde uses el celular
- Para probar en dispositivo físico: el teléfono y la PC del backend en la misma red, o un servidor/dns accesible desde internet

---

## Configuración del servidor (desde la app)

La app no usa un archivo de configuración en el repositorio. La **URL del backend** se configura dentro de la app:

1. En la **pantalla de login**, toca **"▼ Configurar servidor"**.
2. Indica:
   - **DNS/IP:** dirección del servidor donde corre sisteMobile (ej: `192.168.1.10`, `mi-pc.local` o un dominio como `pibeapk.dyndns.org`).
   - **Puerto:** el mismo que tiene configurado el backend en su `config.json` (por defecto `2222`).
3. Toca **"Guardar configuración"**.

La configuración se guarda en el dispositivo (AsyncStorage) y se reutiliza en el siguiente inicio. Las demás pantallas (búsqueda, detalle de producto) usan esa misma URL base para las peticiones a `/api/search`, `/api/product/:id`, etc.

---

## Cómo ejecutar

### Instalar dependencias

```bash
npm install
```

### Modo desarrollo (Expo)

```bash
npm start
```

Se abrirá Expo Dev Tools. Desde ahí puedes:

- Escanear el código QR con **Expo Go** (modo Expo estándar), o
- Usar **dev client** si tienes un build de desarrollo instalado: `npm run start` ya usa `--dev-client`.

### Scripts disponibles

| Comando | Descripción |
|--------|-------------|
| `npm start` | Inicia Expo con dev client |
| `npm run start:expo` | Inicia Expo estándar (Expo Go) |
| `npm run android` | Ejecuta en Android (requiere prebuild/emulador o dispositivo) |
| `npm run ios` | Ejecuta en iOS (requiere Mac y simulador/dispositivo) |
| `npm run web` | Abre la app en el navegador |
| `npm run lint` | Ejecuta ESLint |

---

## Estructura del proyecto

```
sistel-mobile/
├── App.js                 # Entrada, usa RootNavigator
├── index.js                # Punto de entrada Expo
├── navigation/
│   └── RootNavigator.js   # Navegación (Stack: Login, Search, ProductDetail)
├── screens/
│   ├── LoginScreen.js     # Login + configuración de servidor (DNS, puerto)
│   ├── SearchScreen.js    # Búsqueda de productos
│   └── ProductDetailScreen.js  # Detalle y actualización de stock
├── components/
│   └── LogoAndButton.js
├── metro.config.js
└── package.json
```

---

## Resolución de problemas

- **"Error de conexión. Verifique la configuración del servidor"**  
  Comprueba que el backend sisteMobile esté en marcha y que la IP/puerto en la app sean los correctos. Si usas IP local, que el celular esté en la misma red Wi‑Fi que la PC del backend.

- **No aparece el backend en la red**  
  En la PC del backend, revisa que el puerto esté abierto en el firewall y que sisteMobile escuche en `0.0.0.0` (ya lo hace por defecto). Usa la IP de red que muestra la consola del backend al iniciar.

- **Cambios de configuración**  
  Si cambias de red o de servidor, abre de nuevo "Configurar servidor" en la pantalla de login y guarda la nueva IP o dominio y puerto.
