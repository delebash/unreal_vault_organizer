import Dexie from 'dexie';

export const db = new Dexie('unreal_vault');
db.version(1).stores({
  vault_library: 'catalogItemId ,title, description, thumbnail_url, comment, *tagIds',
  user_settings: 'account_number, unreal_token',
  tags: '++id, label, value'
});



