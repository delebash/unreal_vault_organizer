import Dexie from 'dexie';

export const db = new Dexie('unreal_vault');
db.version(1).stores({
  vault_library: 'catalogItemId ,title, description, thumbnail_url',
  user_settings: 'account_number, unreal_token',
  tags: '++id, label, value, color',
  additional_row_info : 'catalogItemId'
});


