<template>
  <div id="app">

    <q-btn class="q-pt-none" dense @click="getVaultRows" color="primary"
           label="Get Vault Items"></q-btn>
    <ag-grid-vue
      style="width: 100%; height: 73%;"
      class="ag-theme-alpine"
      id="myGrid"
      :columnDefs="columnDefs"
      @grid-ready="onGridReady"
      :defaultColDef="defaultColDef"
      :rowData="rowData"
      :getRowNodeId="getRowNodeId"
      :valueCache="true"
      :rowSelection="rowSelection"
      :overlayLoadingTemplate="overlayLoadingTemplate"
      @cell-value-changed="onCellValueChanged"
      @selection-changed="onSelectionChanged"
      @first-data-rendered="onFirstDataRendered">
    </ag-grid-vue>
  </div>
</template>
<style lang="css">
/*@import "../styles.css";*/
</style>
<script>

import {ref} from 'vue'
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import database from '../database';
import {db} from '../db';
import {useObservable} from "@vueuse/rxjs";
import {liveQuery} from "dexie";

let fetch_options = {
  method: '',
  headers: {},
  body: {}
}

export default {
  setup() {

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    const isCancelBeforeStart = () => {
      return false;
    };

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    const isCancelAfterEnd = () => {
      // our editor will reject any value greater than 1000
      return false
    };
    return {
      isCancelAfterEnd,
      isCancelBeforeStart,
      additional_row_info: [],
      modules: [],
      columnDefs: ref([]),
      tag_info_options: ref([]),
      gridApi: null,
      gridColumnApi: null,
      rowData: ref([]),
      getRowNodeId: null,
      selectedRowId: null,
      rowSelection: null,
      overlayLoadingTemplate: null,
      unreal_token: '',
      account_number: '',
      fetch_options: {},
      defaultColDef: {
        width: 150,
        sortable: true,
        editable: true,
        resizable: true,
        filter: true
      }
    }
  },

  async mounted() {
    this.eventBus.on('refreshGrid', (args) => {
      this.refreshGrid(args)
    })
    this.eventBus.on('updateRow', (args) => {
      this.updateRow(args)
    })

    this.columnDefs = [
      {
        headerName: "Catalog Item Id",
        field: "catalogItemId",
        editable: false,
        hide: true
      },
      {
        headerName: "Title",
        field: "title",
        editable: false,
        wrapText: true,
        width: 300,
        cellRenderer: function (params) {
          let title = params.data.title;
          let myTitle = `<div>${title}</div>`;
          return myTitle;
        }
      },
      {
        headerName: "Image",
        editable: false,
        width: 100,
        field: "thumbnail",
        cellRenderer: function (params) {
          let thumbnail_url = params.data.thumbnail_url;
          let Marketplace_url = "https://www.unrealengine.com/marketplace/en-US/item/" + params.data.id;
          let launcher_url = "com.epicgames.launcher://ue/marketplace/item/" + params.data.id;
          let img = `<a href=${launcher_url} target="_blank"><img  width="100" height="100" src= ${thumbnail_url}>`;
          return img;
        }
      },
      {
        headerName: 'Tags',
        field: 'tags',
        autoHeight: true,
        editable: false,
        cellRenderer: 'tag-grid-select',
        width: 270,
      },
      {
        headerName: "Comment",
        field: "comment",
        wrapText: true,
        width: 300,
        cellEditor: 'agLargeTextCellEditor'
      }
    ];
    await this.loadGrid()
  },
  created() {

    this.rowSelection = 'multiple';
    this.overlayLoadingTemplate =
      '<span class="ag-overlay-loading-center">Please wait while your rows are loading. This could take a minute to refresh your data.</span>';
  },
  methods: {
    updateRow(args) {
      let rowNode = this.gridApi.getRowNode(args.rowID);
      rowNode.setDataValue('comment', args.comment);
    },
    refreshGrid(params) {
      this.gridApi.redrawRows()
    },

    async getVaultRows() {
      let user_settings = await db.user_settings.toCollection().first();
      this.unreal_token = user_settings.unreal_token
      this.account_number = user_settings.account_number

      let catalog_url = 'https://catalog-public-service-prod06.ol.epicgames.com/catalog/api/shared/namespace/ue/bulk/items?includeDLCDetails=false&includeMainGameDetails=false&country=US&locale=en'
      let entitlement_url = 'https://entitlement-public-service-prod08.ol.epicgames.com/entitlement/api/account/' + this.account_number + '/entitlements'
      let count_params1 = '?start=0&count=2000'
      // let count_params2 = '?start=1000&count=1000'
      //Get list of entitlements for catalog query
      fetch_options.method = 'GET'
      fetch_options.headers = {
        'Authorization': this.unreal_token,
        'Content-Type': 'application/json'
      }
      let entitlements
      entitlements = await window.myNodeApi.api_fetch(entitlement_url + count_params1, fetch_options)
      await this.getCatalogItems(catalog_url, entitlements)
    },
    async getCatalogItems(catalog_url, entitlements) {
      let start = 0, entitlements_length = entitlements.length || [], response, form_body = '',
        thumbnail_url = ''

      fetch_options.method = 'POST'
      fetch_options.headers = {
        'Authorization': this.unreal_token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }

      while (start <= entitlements_length - 1) {
        let catalog_Itemid = entitlements[start].catalogItemId
        form_body = form_body + 'id=' + catalog_Itemid + '&'
        start = start + 1
      }

      fetch_options.body = form_body.slice(0, -1);
      response = await window.myNodeApi.api_fetch(catalog_url, fetch_options)
      for (let catalog_item of Object.values(response)) {
        thumbnail_url = ''
        for (let keyImage of catalog_item.keyImages) {
          if (keyImage.type === 'Thumbnail') {
            thumbnail_url = keyImage.url
            break;
          }
        }
        const catalog_row = await db.vault_library.where('catalogItemId').equals(catalog_item.id).first()

        if (catalog_row === undefined) {
          await db.vault_library.add({
            catalogItemId: catalog_item.id,
            description: catalog_item.description,
            title: catalog_item.title,
            thumbnail_url: thumbnail_url
          })
        } else {
          await db.vault_library.update(catalog_item.id, {
            description: catalog_item.description,
            title: catalog_item.title,
            thumbnail_url: thumbnail_url
          })
        }
      }
      await this.loadGrid();
    },
    async loadGrid() {

      let catalogItems = await db.vault_library.toArray()
      this.rowData = await Promise.all(catalogItems.map(async catalogItem => {
        catalogItem.tags = await db.tags.where('id').anyOf([1]).toArray()
        return catalogItem
      }));


      // console.log(JSON.stringify(this.catalogItems))
//console.log(this.catalogItems)
      //     this.rowData = this.catalogItems

      //   let results =  await this.getJoin()
      //  console.log(results)
      // this.additional_row_info = await database.getRows('additional_row_info') || []

      // // //  console.log(this.rowData)
      // this.tag_info_options = await database.getRows('tags') || [];
      // if (this.catalogItems.length > 0) {
      //   let rows = []
      //   let labels = []
      //   for (let tag of this.tag_info_options) {
      //     labels.push(tag.label)
      //   }
      // }
    },
    onSelectionChanged() {
      let that = this
      let selectedRows = this.gridApi.getSelectedRows();
      selectedRows.forEach(function (selectedRow, index) {
        that.selectedRowId = selectedRow.catalogItemId;
      })
    },
    async onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    },
    onFirstDataRendered(params) {
      // params.api.sizeColumnsToFit();
    },
    getComment() {
      //return 'test'
    },
    async onCellValueChanged(event) {
      await db.vault_library.update(event.data.catalogItemId, {
        comment: event.data.comment
      })
    }
  }
}


// let catalogItemId = event.data.catalogItemId
// console.log(catalogItemId)
// let description = event.data.description
// let title = event.data.title
// let thumbnail_url = event.data.thumbnail_url
// let comment = event.data.comment
// let tagIds = event.data.tagIds
//
// await db.vault_library.put({
//   catalogItemId: catalogItemId,
//   description: description,
//   title: title,
//   thumbnail_url: thumbnail_url,
//   comment: comment,
//   tagIds: tagIds
// })


//   console.log(params)
//   let rowNode = params.node
//  // rowNode.setDataValue('comment', 'test');
//   this.test(params).then(function (data) {
//     // console.log('test')
//
//    // console.log(params.node)
//  //   let rowNode = params.node
//    // rowNode.setDataValue('comment', 'test');
//     // params.api.refreshCells({
//     //   rowNodes: [params.node],
//     //   columns: [params.column]
//     // });
//   });
//   return false
// }

//async test(params) {
// let value = await db.get('additional_row_info', params.data.id) || ''
//console.log('test')
//  let rowNode = params.node
// rowNode.setDataValue('comment', 'comment');
//  return 'test'
// }

// async setData() {
//   let meta = {}
//   meta.comment = "hhhh"
//   await db.put('vault', meta, this.selectedRowId);
//   let rowNode = this.gridApi.getRowNode(this.selectedRowId);
//   rowNode.setDataValue('comment', meta.comment);
// },
</script>
