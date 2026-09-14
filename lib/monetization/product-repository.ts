import { createDemoCatalog, catalogProducts, findCatalogProduct } from "./catalog";
import type { CatalogProduct } from "./types";
import type { Product, ProductRepository } from "./compat";
import { getMonetizationStore } from "./runtime";

export function catalogProductToLegacy(product: CatalogProduct): Product {
  return {
    id: product.id,
    storeProductId: product.storeProductId,
    title: product.displayName,
    description: product.description,
    priceLabel: product.price.displayPrice ?? "Price unavailable",
    period: product.billingPeriod === "annual" ? "year" : product.billingPeriod === "lifetime" ? "lifetime" : "month",
    plan: product.plan,
  };
}

export const productRepository: ProductRepository = {
  async listProducts() {
    const live = getMonetizationStore().products;
    const products = live.length > 0 ? live : catalogProducts(createDemoCatalog());
    return products.map(catalogProductToLegacy);
  },
  async getProduct(id: string) {
    const catalog = createDemoCatalog();
    const product = findCatalogProduct(catalog, id);
    return product ? catalogProductToLegacy(product) : undefined;
  },
};
