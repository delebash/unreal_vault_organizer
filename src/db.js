import Dexie from 'dexie';

export const db = new Dexie('unreal_vault');
db.version(2).stores({
  vault_library: 'catalogItemId ,title, description, thumbnail_url, comment, *tagIds, updates_available, lastModifiedDate, buildVersion',
  user_settings: 'id ,account_number, unreal_token, vault_cache_path',
  tags: '++id, label, value'
});



