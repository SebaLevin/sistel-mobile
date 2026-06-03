import { api } from './api';

/**
 * Capa de acceso a datos contra platform-api.
 *
 * Aliases que deben estar configurados en el `config.json` del backend:
 *  - vistas.mapeo.productos      → vista SQL con columnas (numint, Concepto, Marca, Codigo, ...)
 *  - vistas.mapeo.stock          → vista SQL con columnas (numint, Almacen, Stock, ...)
 *  - vistas.mapeo.precios        → vista SQL con columnas (numint, NroLista, PrecioFinal, ...)
 *  - operaciones.mapeo.actualizar-stock → SP que recibe (UserName, numint, stock) o lo que defina el cliente.
 */

const ALIAS = {
  productos: 'productos',
  stock: 'stock',
  precios: 'precios',
};

const OPERACION = {
  actualizarStock: 'actualizar-stock',
};

function unwrap(response) {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

export async function searchProductsByName(term) {
  const res = await api.get(`/vistas/${ALIAS.productos}/search`, {
    params: { Concepto: String(term).trim() },
  });
  return unwrap(res);
}

export async function searchProductsByCode(code) {
  // Búsqueda por código de barra (EAN) → columna CodBar de la vista.
  // El scanner suele anexar un espacio/whitespace al final; lo limpiamos
  // para que el LIKE del backend no exija ese carácter literal.
  const res = await api.get(`/vistas/${ALIAS.productos}/search`, {
    params: { CodBar: String(code).trim() },
  });
  return unwrap(res);
}

export async function getProductStock(numint) {
  const res = await api.get(`/vistas/${ALIAS.stock}/search`, {
    params: { numint__eq: numint },
  });
  return unwrap(res);
}

export async function getProductPrices(numint) {
  const res = await api.get(`/vistas/${ALIAS.precios}/search`, {
    params: { numint__eq: numint },
  });
  return unwrap(res);
}

export async function getProductDetails(numint) {
  const [stock, price] = await Promise.all([
    getProductStock(numint),
    getProductPrices(numint),
  ]);
  return { stock, price };
}

export async function updateProductStock(numint, stock) {
  // El SP del cliente (dbo.mobileStockUpdate) espera @IDProduct, @UserName, @Stock.
  // UserName lo inyecta el backend desde el JWT (config.injectUserField).
  const { data } = await api.post(`/operaciones/${OPERACION.actualizarStock}`, {
    IDProduct: numint,
    Stock: stock,
  });
  return data;
}
