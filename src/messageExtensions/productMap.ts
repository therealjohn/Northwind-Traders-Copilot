import { ProductEx } from '../northwindDB/model';

export const productMap = new Map<string, ProductEx>();

export function setProduct(token: string, product: ProductEx) {
    productMap.set(token, product);
}

export function getProduct(token: string): ProductEx | undefined {
    return productMap.get(token);
}

export function hasProduct(token: string): boolean {
    return productMap.has(token);
}

export function deleteProduct(token: string): boolean {
    return productMap.delete(token);
}