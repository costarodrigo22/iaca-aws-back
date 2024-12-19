export function mapAddressItem(item: Record<string, any>) {
  return {
    id: item.id,
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
    selected: item.selected,
    is_default: item.is_default,
  };
}

export function mapAddressItems(items: Record<string, any>[]) {
  return items.map(mapAddressItem);
}
