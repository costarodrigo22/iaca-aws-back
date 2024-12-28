export function userMapperItem(items: Record<string, any>) {
  return {
    id: items[0].id,
    code_omie: items[0].code_omie,
    document: items[0].document,
    email: items[0].email,
    name: items[0].name,
    phone: items[0].phone,
    is_address_default_registered: items[0].is_address_default_registered,
    avatarUrl: items[0].avatarUrl,
  };
}

export function mapUserItems(items: Record<string, any>[]) {
  return items.map(userMapperItem);
}
