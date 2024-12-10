export function mapCartItem(item: Record<string, any>) {
  return {
    id: item.id,
    product_name: item.product_name,
    product_quantity: item.product_quantity,
    product_price: item.product_price,
    product_code: item.product_code,
    product_url_image: item.product_url_image,
  };
}

export function mapCartItems(items: Record<string, any>[]) {
  return items.map(mapCartItem);
}
