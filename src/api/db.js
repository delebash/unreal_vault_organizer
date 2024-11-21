import Dexie from 'dexie'

export const db = new Dexie('unreal_vault_organizer')
db.version(10).stores({
  vaultLibrary: ',comment, *tagIds, asset ',
  userSettings: 'id , cachePath ,auth',
  tags: '++id, label, value',
  colorPalette: 'label, value'
})

// vaultItems: 'assetId,assetNamespace,categories,customAttributes,description,distributionMethod,images,projectVersions,source,title,url',

// vaultLibrary: 'catalogItemId ,title, description, thumbnail_url, comment, *tagIds, updates_available, lastModifiedDate, buildVersion,url,artifactId',
