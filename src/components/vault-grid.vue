<template>
  <div id="app">

    <q-btn class="q-pt-none" dense @click="getVault()" color="primary"
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
import {openDB} from 'idb';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";



let db
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
      modules: [],
      columnDefs: ref([]),
      tag_info_options: ref([]),
      catalogItems: [],
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
  async beforeMount() {

  },
  async mounted() {
    this.eventBus.on('refreshGrid', (args) => {
      this.refreshGrid(args)

    })

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
        const additional_row_info = db.createObjectStore('additional_row_info', {
          // The 'id' property of the object will be the key.
          keyPath: 'catalogItemId'
        });
      },
    });
    this.catalogItems = await db.get('vault', 'vault_catalog') || [];
    this.tag_info_options = await db.getAll('tags') || [];
    //  console.log(this.tag_info_options)
 //   await db.put('vault', JSON.stringify(this), 'grid_context');
    await this.loadGrid()
  },
  created() {
    this.rowSelection = 'multiple';
    this.overlayLoadingTemplate =
      '<span class="ag-overlay-loading-center">Please wait while your rows are loading. This could take a minute to refresh your data.</span>';
  },
  methods: {
    refreshGrid(params) {
      this.gridApi.redrawRows()
    },
    async getVault() {

      this.unreal_token = await db.get('vault', 'unreal_token')
      this.account_number = await db.get('vault', 'account_number')

      let catalog_url = 'https://catalog-public-service-prod06.ol.epicgames.com/catalog/api/shared/namespace/ue/bulk/items?includeDLCDetails=false&includeMainGameDetails=false&country=US&locale=en'
      let entitlement_url = 'https://entitlement-public-service-prod08.ol.epicgames.com/entitlement/api/account/' + this.account_number + '/entitlements'
      let count_params1 = '?start=0&count=1000'
      let count_params2 = '?start=1000&count=1000'
      //Get list of entitlements for catalog query
      fetch_options.method = 'GET'
      fetch_options.headers = {
        'Authorization': this.unreal_token,
        'Content-Type': 'application/json'
      }


      let entitlements
      entitlements = await window.myNodeApi.api_fetch(entitlement_url + count_params1, fetch_options)

      await this.getCatalogItems(catalog_url, entitlements)
      this.catalogItems = await db.get('vault', 'vault_catalog');
      await this.loadGrid();
      //
      // fetch_options.method = 'GET'
      // fetch_options.headers = {
      //   Authorization: this.unreal_token,
      //   ['Content-Type']: 'application/json',
      // }
      //
      // entitlements = await window.myNodeApi.api_fetch(entitlement_url + count_params2, fetch_options)

      // await this.getCatalogItems(catalog_url,entitlements)

    },
    async getCatalogItems(catalog_url, entitlements) {

      fetch_options.method = 'POST'
      fetch_options.headers = {
        'Authorization': this.unreal_token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }

      let arrCatalog = [];
      let start = 0;
      let entitlements_length = entitlements.length || [];
      let response;
      let form_body = ''
      let val;

      while (start <= entitlements_length - 1) {
        let catalog_Itemid = entitlements[start].catalogItemId
        form_body = form_body + 'id=' + catalog_Itemid + '&'
        start = start + 1
      }
      //post data
      fetch_options.body = form_body.slice(0, -1);
      response = await window.myNodeApi.api_fetch(catalog_url, fetch_options)

      for (val of Object.values(response)) {
        arrCatalog.push(val)
      }
      await db.put('vault', arrCatalog, 'vault_catalog');
    },

    onSelectionChanged() {
      let that = this
      let selectedRows = this.gridApi.getSelectedRows();
      selectedRows.forEach(function (selectedRow, index) {
        that.selectedRowId = selectedRow.catalogItemId;
      })
    },


    // async setData() {
    //   let meta = {}
    //   meta.comment = "hhhh"
    //   await db.put('vault', meta, this.selectedRowId);
    //   let rowNode = this.gridApi.getRowNode(this.selectedRowId);
    //   rowNode.setDataValue('comment', meta.comment);
    // },
    async onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    },
    onFirstDataRendered(params) {
      // params.api.sizeColumnsToFit();
    },
    async loadGrid() {
      if (this.catalogItems.length > 0) {
        let rows = []
        let labels = []
        for (let tag of this.tag_info_options) {
          labels.push(tag.label)
        }
        this.columnDefs = [
          {
            headerName: "Item ID",
            field: "id",
            editable: false
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
            width: 94,
            field: "thumbnail",
            cellRenderer: function (params) {
              let thumbnail_url = params.data.thumbnail_url;
              let Marketplace_url = "https://www.unrealengine.com/marketplace/en-US/item/" + params.data.id;
              let launcher_url = "com.epicgames.launcher://ue/marketplace/item/" + params.data.id;
              let img = `<a href=${launcher_url} target="_blank"><img  width="50" height="50" src= ${thumbnail_url}>`;
              return img;
            }
          },
          {
            headerName: 'Tags',
            field: 'tags',
            autoHeight: true,
            editable: false,
            cellRenderer: 'tag-grid-select',
            width: 300,
          },
        ];

        let thumbnail_url

        for (let i = 0; i < this.catalogItems.length; i++) {
          for (let image of this.catalogItems[i].keyImages) {
            if (image.type === 'Thumbnail') {
              thumbnail_url = image.url
              break
            }
          }
          rows.push({
            id: this.catalogItems[i].id,
            title: this.catalogItems[i].title,
            description: this.catalogItems[i].description,
            thumbnail_url: thumbnail_url
          })
        }
        this.rowData = rows
      }
    },
    async getTags(params) {

      // console.log(params)
      //let id = row.data.id
      //let results =  await db.get('tags', tag_id) || [];
      // console.log(row)
      return 'test'
    },
    async saveData(data) {
      let meta = {
        comment: ''
      }
      for (let i = 0; i < data.length; i++) {
        let catalogItem = data[i]
        let catalogItemId = data[i].catalogItemId
        await db.put('vault', catalogItem, catalogItemId);
        let rowExists = await db.get('vault', catalogItemId);
        if (rowExists == null) {
          await db.put('vault', meta, catalogItemId);
        }
      }
    },
    extractValues(mappings) {
      // let arrLabel = []
      // for (let tag of tags) {
      //   arrLabel.push(tag.label)
      // }
      // return arrLabel
      return Object.keys(mappings);
    },
    onCellValueChanged(event) {
      //let catalogItemId = event.data.catalogItemId
      // let meta = {}
      // let comment = event.data.comment
      // meta.comment = comment
      // // let anotherfield = event.data.anotherfield
      // // meta.anotherfield = anotherfield
      // db.put('vault', meta, catalogItemId);
    }
  }
}


// {
//   headerName: "Comment",
//   field: "comment",
//   wrapText: true,
//   cellEditor: 'agLargeTextCellEditor',
//   valueSetter: (params) => {
//     let newVal = params.newValue;
//     let valueChanged = params.data.comment !== newVal;
//     if (valueChanged) {
//       params.data.comment = newVal;
//     }
//     return valueChanged;
//   },
// }
</script>
