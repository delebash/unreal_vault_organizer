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
            popup-content-class="no_space"
            multiple
            :options="tag_info_options"
            @update:model-value="addTag"
  >

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>


    <!--    <template v-slot:option="scope">-->
    <!--      <q-chip-->
    <!--        removable-->
    <!--        dense-->
    <!--        :color=scope.opt.color-->
    <!--        @remove="scope.removeAtIndex(scope.index)"-->
    <!--        :tabindex="scope.tabindex"-->
    <!--        class="q-ma-none"-->
    <!--        @click="selectedTag(scope.opt)"-->
    <!--      >-->
    <!--        {{ scope.opt.label }}-->
    <!--      </q-chip>-->
    <!--    </template>-->
    <!--    <template v-slot:selected="scope">-->
    <!--      @click="selectedTag(scope.opt.label)"-->
    <!--    </template>-->
    <template v-slot:selected-item="scope">
      <q-chip
        removable
        dense
        :color=scope.opt.color
        @remove="scope.removeAtIndex(scope.index)"
        :tabindex="scope.tabindex"
        class="q-ma-none"
      >
        {{ scope.opt.label }}
      </q-chip>
    </template>
  </q-select>


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
      tags_listed: '',
      tag_info_options: ref([]),
    }
  },
  mounted: async function () {

    db = await openDB('Unreal-Vault', 1, {
      upgrade(db) {
        // Create a store of objects
        const vault = db.createObjectStore('vault', {
          // The 'id' property of the object will be the key.

        });
        const vault_user_data = db.createObjectStore('vault_user_data', {
          // The 'id' property of the object will be the key.

        });
        const tags = db.createObjectStore('tags', {
          // The 'id' property of the object will be the key.
          keyPath: 'id',
          autoIncrement: true
        });
        const additional_row_info = db.createObjectStore('additional_row_info', {
          // The 'id' property of the object will be the key.
          keyPath: 'catalogItemId'

        });
      },
    });
    await this.loadData()
  },
  methods: {
    async addTag(tag) {
      let results = await this.saveTagDb('additional_row_info', this.tags, "PUT")

    },
    async removeTag(tag) {
      // console.log(tag)
      //   let results = await this.saveDb('additional_row_info')
      //   console.log(results)
      // const index = this.tag_info_options.findIndex(({label}) => label === tag.label);
      // let tag_to_delete = JSON.parse(JSON.stringify(tag));
      // this.tag_info_options.splice(index, 1)
      // this.selected_tags.splice(index, 1)
      // await this.saveDb('tags', tag_to_delete, 'DELETE')
    },
    async saveTagDb(database, tags, action) {
      let rowId = this.params.data.id
      let arrTags = []
      for (let tag of tags) {
        arrTags.push(tag.id)
      }
      console.log(arrTags)
      //
      await db.put(database, {
              tag_ids: JSON.stringify(arrTags),
              catalogItemId: rowId
            })

      // if (action === 'ADD') {
      //   await db.add(database, {
      //     tag: JSON.stringify(arrTags),
      //     catalogItemId: rowId
      //   })
      //
      // } else if (action === 'PUT') {
      //   await db.put(database, {
      //     tag: JSON.stringify(arrTags),
      //     catalogItemId: rowId
      //   })
      // } else if (action === 'DELETE') {
      //   await db.delete(database, tag.id)
      // }
    },
    async saveDb(database, tag, action) {

      let rowId = this.params.data.id

      if (action === 'ADD') {
        await db.add(database, {
          label: tag.value.label,
          value: tag.value.value,
          color: tag.value.color,
          id: tag.value.id,
          selected: false,
          catalogItemId: rowId
        })
        this.tag_info_options.push(tag)
      } else if (action === 'PUT') {
        await db.put(database, {
          label: tag.value.label,
          value: tag.value.value,
          color: tag.value.color,
          id: tag.value.id,
          selected: false,
          catalogItemId: rowId
        })
      } else if (action === 'DELETE') {
        await db.delete(database, tag.id)
      }
    },
    selectedTag(e) {
      // console.log(this.params)
    },
    async loadData() {

      this.tag_info_options = await db.getAll('tags') || [];
    }
  }
}
</script>

<style scoped>

</style>
