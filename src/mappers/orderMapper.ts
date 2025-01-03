import { mapAddressItem } from "./addressMapper";
import { mapCartItems } from "./cartMapper";

export function mapOrderItem(item: Record<string, any>) {
  return {
    id: item.id,
    address: mapAddressItem(item.address),
    products: mapCartItems(item.products),
    total: item.total,
    payment_form: item.payment_form,
    delivery_form: item.delivery_form,
    order_number: item.order_number,
    order_number_omie: item.order_number_omie,
    orderStatus: item.orderStatus,
  };
}

export function mapOrderItems(items: Record<string, any>[]) {
  return items.map(mapOrderItem);
}
