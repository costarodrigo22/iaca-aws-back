export function mapAddressItem(item: Record<string, any>) {
  return {
    cep: item.cep,
    country: item.country,
    street: item.street,
    number: item.number,
    neighborhood: item.neighborhood,
    complement: item.complement,
    city: item.city,
    state: item.state,
    uf: item.uf,
    reference: item.reference,
  };
}

export function mapAddressItems(items: Record<string, any>[]) {
  return items.map(mapAddressItem);
}
