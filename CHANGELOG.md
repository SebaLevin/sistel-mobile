# Changelog

Todos los cambios relevantes de esta app quedan documentados aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Fixed

- [screens/SearchScreen.js](screens/SearchScreen.js) + [lib/data.js](lib/data.js): búsqueda por código de barra. El scanner anexaba un espacio al final del código (`"7792180001641 "`), que viajaba dentro del patrón `LIKE '%...  %'` del backend y nunca matcheaba → ahora se trimea el valor escaneado/tipeado. Además `searchProductsByCode` pegaba a la columna `Codigo` (SKU interno, ej. `SALTA.173`) en vez de `CodBar` (el EAN) → corregido a `CodBar`. Esto elimina la necesidad del parche que se había hecho en la vista `dbo.VistaMobileProductos` del cliente (`CodBar + ' ' as Concepto`, `Concepto as Marca`), que corrompía las columnas de descripción/marca y rompía la búsqueda por nombre. La vista debe revertirse a sus columnas reales.

### Changed

- [screens/SearchScreen.js](screens/SearchScreen.js): la caja de búsqueda manual ahora auto-detecta si lo tipeado es un código de barra (todo dígitos, largo ≥ 8) y en ese caso busca por `CodBar`; de lo contrario busca por nombre (`Concepto`). Una sola caja sirve para nombre y EAN, sin OR en el backend.
- Dependencias alineadas a Expo SDK 52 vía `npx expo install --fix`: `expo` `~52.0.17` → `~52.0.49`, `react-native` `0.76.3` → `0.76.9`, `@react-native-async-storage/async-storage` `^2.2.0` → `1.23.1`, `expo-build-properties` `^0.13.1` → `~0.13.3`, `expo-status-bar` `~2.0.0` → `~2.0.1`, `expo-system-ui` `^4.0.5` → `~4.0.9`, `react-native-screens` `~4.1.0` → `~4.4.0`. Sin esto, Metro quedaba colgado bundleando sin tirar error visible.
- [screens/LoginScreen.js](screens/LoginScreen.js): preview de la URL de configuración actualizado a `URL base: http://{dns}:{port} (login: POST /auth/login)` (antes mostraba `/api/login` del backend viejo).
- [lib/data.js](lib/data.js): `getProductStock` y `getProductPrices` ahora usan el sufijo `numint__eq` (exact match) en lugar de `numint` (que el backend interpreta como LIKE `%val%`). El LIKE devolvía falsos positivos en columnas numéricas: pidiendo stock de numint=327 traía también filas de 18327, 13272, 3276, etc. Requiere `platform-api` ≥ 2.0.4 (sin esa versión el sufijo se trata como nombre de columna y tira `Invalid column name 'numint__eq'`).
- [lib/data.js](lib/data.js): `updateProductStock` ahora manda `{ IDProduct, Stock }` (PascalCase) en lugar de `{ numint, stock }`. El SP `dbo.mobileStockUpdate` del cliente espera los parámetros con esos nombres exactos. `UserName` lo sigue inyectando el backend desde el JWT.

### Pendiente

- Configurar los aliases en `platform-api/config.json` para que las llamadas del mobile resuelvan a vistas / SPs reales (ver sección "Configuración requerida en el backend" más abajo).
- Si las columnas de las vistas SQL no se llaman exactamente `Concepto`, `Marca`, `Codigo`, `numint`, `Almacen`, `Stock`, `NroLista`, `PrecioFinal`, ajustar [lib/data.js](lib/data.js) (param keys + unwrapping) o crear vistas SQL con alias de columna que sí coincidan.

## [1.2.0] - 2026-05-12

### Added

- [lib/data.js](lib/data.js) — capa única de acceso al backend de datos. Encapsula los paths, aliases y la respuesta paginada de `platform-api`, dejando a las screens libres de detalles del contrato.
- Helpers expuestos: `searchProductsByName`, `searchProductsByCode`, `getProductStock`, `getProductPrices`, `getProductDetails`, `updateProductStock`.

### Changed

- [screens/SearchScreen.js](screens/SearchScreen.js):
  - `GET /api/search?searchTerm=X` → `GET /vistas/productos/search?Concepto=X` (búsqueda por texto en el campo del concepto).
  - El escaneo de código de barras ahora pega a `?Codigo=<barcode>` en la misma vista (antes ambos canales caían en el mismo endpoint genérico).
  - El parseo de la respuesta ahora soporta tanto array crudo como objeto paginado `{ data, pagination }`.
- [screens/ProductDetailScreen.js](screens/ProductDetailScreen.js):
  - `GET /api/product/:numint` (devolvía `{ stock, price }`) → ahora hace **dos** requests en paralelo: `GET /vistas/stock/search?numint=...` y `GET /vistas/precios/search?numint=...`, y combina del lado del cliente.
  - `PUT /api/product/:numint/stock` con `{ username, stock }` → `POST /operaciones/actualizar-stock` con `{ numint, stock }`. El `username` ya no se envía: el backend lo inyecta desde `req.user` (el JWT del Authorization header).

### Configuración requerida en el backend

Para que esta versión funcione end-to-end, en `platform-api/config.json` deben existir los siguientes aliases (los nombres `dbo.Vista...` y `SP_...` son ejemplos — usar los reales del cliente):

```json
{
  "vistas": {
    "mapeo": {
      "productos": "dbo.VistaProductos",
      "stock":     "dbo.VistaStock",
      "precios":   "dbo.VistaPrecios"
    }
  },
  "operaciones": {
    "mapeo": {
      "actualizar-stock": {
        "sp": "SP_ActualizarStock",
        "params": ["UserName", "numint", "stock"],
        "injectUserField": "UserName"
      }
    }
  }
}
```

Columnas que el mobile espera ver en cada vista (si la vista SQL las llama distinto, alias en el `SELECT`):

| Vista       | Columnas usadas                     |
|-------------|-------------------------------------|
| `productos` | `numint`, `Concepto`, `Marca`, `Codigo` |
| `stock`     | `numint`, `Almacen`, `Stock`        |
| `precios`   | `numint`, `NroLista`, `PrecioFinal` |

## [1.1.0] - 2026-05-12

## [1.1.0] - 2026-05-12

### Added

- Bootstrap de autenticación en [App.js](App.js): al arrancar la app se verifica si hay token en `SecureStore` y, si existe, se enruta directo a `Buscar` saltándose `Inicio` y `Login`.
- Llamada real al backend en el logout: [lib/auth.js](lib/auth.js) ahora llama `POST /auth/logout` antes de limpiar el storage local. Si la llamada falla, el cleanup local se ejecuta igual (vía `finally`).
- Pantalla de carga (`ActivityIndicator`) mientras se chequea el estado de sesión al arrancar.

### Changed

- Endpoints de auth alineados con `platform-api`:
  - `POST /api/login` → `POST /auth/login`
  - `POST /api/refresh` → `POST /auth/refresh`
- Body del refresh: `{ refreshToken }` → `{ refresh_token }` (snake_case según contrato del backend).
- Campos de la respuesta de login/refresh: `token` / `refreshToken` → `access_token` / `refresh_token`.
- URL por defecto del backend en [lib/api.js](lib/api.js) y [screens/LoginScreen.js](screens/LoginScreen.js):
  - DNS: `pibeapk.dyndns.org` → `10.0.2.2` (Android emulator)
  - Port: `2222` → `3501`
- `RootNavigator` ahora acepta `initialRouteName` como prop para soportar el bootstrap condicional de auth.
- Versión Expo en [app.json](app.json) sincronizada con `package.json` (`0.5.0` → `1.1.0`).

### Fixed

- El login fallaba silenciosamente con la respuesta del nuevo backend porque los nombres de los tokens no coincidían (`token` vs `access_token`).
- El interceptor de refresh axios reintentaba contra `/api/refresh` (inexistente) — ahora apunta a `/auth/refresh`.

### Notes

- El backend `platform-api` puede correrse con `MOCK_AUTH=1` (env var) para desarrollo sin SQL Server. Usuarios válidos en mock: `admin/admin` y `sebastian/sebastian`.

## [1.0.0]

Primera versión publicada. Login básico con JWT contra el backend antiguo. Listado y detalle de productos con actualización de stock.
