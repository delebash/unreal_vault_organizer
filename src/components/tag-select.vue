<template>
  <q-select class="no_space"
            options-dense
            dense
            clearable
            filled
            outlined
            hide-dropdown-icon
            v-model="tags"
            use-chips
            autofocus
            hide-bottom-space
            item-aligned
            input-class="no_space"
            popup-content-class ="no_space"
            multiple
            :options="tag_info_options"
  >

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
  </q-select>


  <span v-for="tag in tag_info_options">
          <q-chip
            removable
            clickable
            @remove="removeTag(tag)"
            :color=tag.color
          >
        {{ tag.label }}
      </q-chip>
  </span>

</template>

<script>
import {ref} from 'vue'
import {openDB} from "idb";

let db

export default {
  name: "TagSelect",
  setup() {
    return {
      tags: ref([]),
      tag_info_options: ref([]),
    }
  },
  mounted: async function () {
    db = await openDB('Unreal-Vault', 1, {
      upgrade(db) {
        // Create a store of objects
        const vault = db.createObjectStore('vault', {
          // The 'id' property of the object will be the key.
          //  keyPath: 'catalogItemId'
        });
        const vault_user_data = db.createObjectStore('vault_user_data', {
          // The 'id' property of the object will be the key.
          //  keyPath: 'catalogItemId'
        });
        const tags = db.createObjectStore('tags', {
          // The 'id' property of the object will be the key.
          keyPath: 'id',
          autoIncrement: true
        });
      },
    });
    await this.loadData()
  },
  methods: {
    async removeTag(tag) {
      const index = this.tag_info_options.findIndex(({label}) => label === tag.label);
      let tag_to_delete = JSON.parse(JSON.stringify(tag));
      // this.tag_info_options.splice(index, 1)
      // this.selected_tags.splice(index, 1)
      // await this.saveDb('tags', tag_to_delete, 'DELETE')
    },
    async saveDb(database, tag, action) {
      let id
      if (action === 'ADD') {
        id = await db.add(database, {
          label: tag.label,
          value: tag.value,
          color: tag.color,
          selected: false
        })
        tag.id = id
        this.tag_info_options.push(tag)
      } else if (action === 'PUT') {
        await db.put(database, {
          label: tag.label,
          value: tag.value,
          color: tag.color,
          id: tag.id,
          selected: false
        })
      } else if (action === 'DELETE') {
        await db.delete(database, tag.id)
      }
    },
    async loadData() {
      this.tag_info_options = await db.getAll('tags') || [];
      console.log('test')
    }
  }
}
</script>

<style scoped>

</style>
