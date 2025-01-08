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
    id_pix_omie: item.id_pix_omie,
    order_code_omie: item.order_code_omie,
    freight: item.freight,
    orderStatus: item.orderStatus,
    createdAt: item.createdAt,
  };
}

export function mapOrderItems(items: Record<string, any>[]) {
  return items?.map(mapOrderItem);
}
