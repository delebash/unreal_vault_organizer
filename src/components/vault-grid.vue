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
      // {
      //   headerName: 'Tags',
      //   field: 'tags',
      //   autoHeight: true,
      //   editable: false,
      //   cellRenderer: 'tag-grid-select',
      //   width: 270,
      // },
      // {
      //   headerName: "Comments",
      //   field: "comment",
      //   wrapText: true,
      //   width: 300,
      //   cellEditor: 'agLargeTextCellEditor'
      // }
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

    async loadGrid() {
      this.rowData = await database.getRows('vault_library') || []
    //  console.log(this.rowData)
      // this.tag_info_options = await db.getAll('tags') || [];
      // if (this.catalogItems.length > 0) {
      //   let rows = []
      //   let labels = []
      //   for (let tag of this.tag_info_options) {
      //     labels.push(tag.label)
      //   }
    },
    async getVault() {
      let row = await database.getRow('user_settings')
      if (row) {
        this.unreal_token = row.unreal_token
        this.account_number = row.account_number

        let catalog_url = 'https://catalog-public-service-prod06.ol.epicgames.com/catalog/api/shared/namespace/ue/bulk/items?includeDLCDetails=false&includeMainGameDetails=false&country=US&locale=en'
        let entitlement_url = 'https://entitlement-public-service-prod08.ol.epicgames.com/entitlement/api/account/' + this.account_number + '/entitlements'
        let count_params1 = '?start=0&count=2000'
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
        await this.loadGrid();
      }
    },
    async getCatalogItems(catalog_url, entitlements) {
      fetch_options.method = 'POST'
      fetch_options.headers = {
        'Authorization': this.unreal_token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }

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

      let data
      fetch_options.body = form_body.slice(0, -1);
      response = await window.myNodeApi.api_fetch(catalog_url, fetch_options)
      let count = 0
      for (let catalog_item of Object.values(response)) {
        count = count + 1
        data = {}
        data.catalogItemId = catalog_item.id
        data.description = catalog_item.description
        data.title = catalog_item.title

        for (let keyImage of catalog_item.keyImages) {
          if (keyImage.type === 'Thumbnail') {
            data.thumbnail_url = keyImage.url
          }
        }
        await database.putRow('vault_library', data)
      }
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

    cellChanged() {
      console.log('test')
    },
    async test(params) {
      // let value = await db.get('additional_row_info', params.data.id) || ''
      //console.log('test')
      let rowNode = params.node
      // rowNode.setDataValue('comment', 'comment');
      return 'test'
    },
    async saveData(data) {
      // let meta = {
      //   comment: ''
      // }
      // for (let i = 0; i < data.length; i++) {
      //   let catalogItem = data[i]
      //   let catalogItemId = data[i].catalogItemId
      //   await db.put('vault', catalogItem, catalogItemId);
      //   let rowExists = await db.get('vault', catalogItemId);
      //   if (rowExists == null) {
      //     await db.put('vault', meta, catalogItemId);
      //   }
      // }
    },

    onCellValueChanged(event) {
      //
      //  let catalogItemId = event.data.id
      //  let data = {}
      //  data.comment = event.data.comment
      //  data.catalogItemId = catalogItemId
      //  // console.log(catalogItemId)
      // //db.put('additional_row_info', data);
      //  db.put('additional_row_info', data, catalogItemId);
    }
  }
}


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

</script>
