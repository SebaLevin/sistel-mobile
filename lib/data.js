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

// Columnas de la vista de productos en las que se busca un término.
//  - Concepto: descripción/nombre (ej. "COCA COLA LATA 354CC")
//  - Codigo:   código interno / SKU (ej. "SALTA.173")
//  - CodBar:   EAN / código de barra (ej. "7790895000232")
const COLUMNAS_BUSQUEDA = ['Concepto', 'Codigo', 'CodBar'];

async function searchProductsByColumn(column, value) {
  try {
    const res = await api.get(`/vistas/${ALIAS.productos}/search`, {
      params: { [column]: value },
    });
    return unwrap(res);
  } catch {
    // Una columna que falle (p. ej. inexistente en la vista) no debe tumbar
    // la búsqueda completa: se ignora y se sigue con las demás.
    return [];
  }
}

/**
 * Busca un término en descripción (Concepto), código interno (Codigo) y EAN (CodBar).
 * El backend hace LIKE por columna y AND entre params (no OR), así que disparamos
 * un request por columna en paralelo y mergeamos por `numint` sin duplicados.
 * Sirve tanto para la caja manual como para el scanner / lector físico.
 */
export async function searchProducts(term) {
  const clean = String(term).trim();
  if (!clean) return [];

  const porColumna = await Promise.all(
    COLUMNAS_BUSQUEDA.map((col) => searchProductsByColumn(col, clean)),
  );

  const seen = new Set();
  const merged = [];
  for (const rows of porColumna) {
    for (const row of rows) {
      const key = row?.numint;
      if (key == null || seen.has(key)) continue;
      seen.add(key);
      merged.push(row);
    }
  }
  return merged;
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
