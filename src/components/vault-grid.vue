<template>
  <div class="row">
    <div class="col">

      <q-btn class="q-pt-none" dense @click="loadGrid" color="deep-orange-12"
             label="Refresh Grid"></q-btn>
      ---
      <q-btn class="q-pt-none" dense @click="downloadVault" color="primary"
             label="Download Vault"></q-btn>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <q-chip v-show="updates" color="yellow-9" text-color="white">
        Updates Available
      </q-chip>

      <ag-grid-vue
        style="width: 100%; height: 91%;"
        class="ag-theme-alpine"
        id="myGrid"
        :refreshCells="true"
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
      <b>Row count:</b> {{ rowCount }}
    </div>
  </div>
</template>
<style lang="css">

</style>
<script>

import {ref} from 'vue'
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import {db} from '../db';
import {useQuasar, Notify} from 'quasar'


let fetch_options = {
  method: '',
  headers: {},
  body: {}
}

export default {

  setup() {
    const $q = useQuasar()
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
      build_versions: [],
      updates: false,
      modules: [],
      qt: $q,
      vault_cache_path: '',
      columnDefs: ref([]),
      tag_info_options: ref([]),
      rowCount: 0,
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
      this.loadGrid()
    })
    this.eventBus.on('filteredRows', (args) => {
      this.filterRows(args)
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
        sort: 'asc',
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
        width: 90,
        autoHeight: true,
        field: "thumbnail",
        cellRenderer: function (params) {
          let thumbnail_url = params.data.thumbnail_url;
          let Marketplace_url = "https://www.unrealengine.com/marketplace/en-US/item/" + params.data.catalogItemId;
          let launcher_url = "com.epicgames.launcher://ue/marketplace/item/" + params.data.catalogItemId;
          let img = `<a href=${launcher_url} target="_blank"><img  width="50" height="50" src= ${thumbnail_url}>`;
          return img;
        }
      },
      {
        headerName: "Description",
        field: "description",
        editable: false,
        autoHeight: true,
        wrapText: true,
        width: 300
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
      },
      {
        headerName: 'Updates Available',
        field: 'updates_available',
        autoHeight: true,
        editable: false,
        cellRenderer: 'checkbox-grid',
        width: 165,
      },
      {
        headerName: 'Last Modified Data',
        field: 'lastModifiedDate',
        editable: false,
        width: 200,
      },
      {
        headerName: 'Build Version',
        field: 'buildVersion',
        editable: false,
        width: 270,
      },
      {
        headerName: 'Compatible Version',
        field: 'ue_version',
        editable: false,
        width: 270,
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
    showNotify(msg, color, position, icon) {
      this.qt.notify({
        message: msg,
        color: color,
        position: position,
        icon: icon
      })
    },
    filterRows(args) {
      this.gridApi.setRowData(args.rows);
    },
    async downloadVault() {
      this.qt.loading.show()

      let user_settings = await db.user_settings.where("id").equals(1).first();
      if (user_settings !== null && user_settings !== undefined) {
        this.unreal_token = user_settings.unreal_token
        this.account_number = user_settings.account_number
        this.vault_cache_path = user_settings.vault_cache_path

        let catalog_url = 'https://catalog-public-service-prod06.ol.epicgames.com/catalog/api/shared/namespace/ue/bulk/items?includeDLCDetails=false&includeMainGameDetails=false&country=US&locale=en'
        let entitlement_url = 'https://entitlement-public-service-prod08.ol.epicgames.com/entitlement/api/account/' + this.account_number + '/entitlements'
        let assets_url = 'https://launcher-public-service-prod06.ol.epicgames.com/launcher/api/public/assets/Windows?label=Live'

        fetch_options.method = 'GET'
        fetch_options.headers = {
          'Authorization': this.unreal_token,
          'Content-Type': 'application/json'
        }
        fetch_options.url = assets_url
        let assets = await window.myNodeApi.api_fetch(fetch_options)
        let count_params, start = 0, count = 1000

        //loop 20 times or until entitlements count = 0 this should load 20,000 assets if someone has that many
        for (let i = 0; i <= 20; i++) {
          fetch_options.method = 'GET'
          fetch_options.headers = {
            'Authorization': this.unreal_token,
            'Content-Type': 'application/json'
          }
          count_params = '?start=' + start + '&count=' + count
          fetch_options.url = entitlement_url + count_params
          let entitlements = await window.myNodeApi.api_fetch(fetch_options)
          if (Array.isArray(entitlements) === true && entitlements.length > 0) {
            await this.getCatalogItems(catalog_url, entitlements, assets)
            start = start + count
          } else if (i === 0 && entitlements.length === 0) {
            this.showNotify('Please request a new token', 'negative', 'top', 'report_problem')
            this.qt.loading.hide()
            break;
          } else {
            if (entitlements.errorCode) {
              this.showNotify('Please request a new token', 'negative', 'top', 'report_problem')
              this.qt.loading.hide()
            }
            break
          }
        }
        await this.loadGrid()
        this.qt.loading.hide()
      } else {
        this.showNotify('Please verify your settings tab information', 'negative', 'top', 'report_problem')
        this.qt.loading.hide()
      }
    },
    async getCatalogItems(catalog_url, entitlements, assets) {
      let start = 0, entitlements_length = entitlements.length || [], response, form_body = '',
        thumbnail_url = '', buildVersion = ''

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
      fetch_options.url = catalog_url
      let items = await window.myNodeApi.api_fetch(fetch_options)
      for (let catalog_item of Object.values(items)) {
        buildVersion = ''
        for (let asset of assets) {
          if (asset.catalogItemId === catalog_item.id) {
            if (asset.buildVersion.length > 0) {
              buildVersion = asset.buildVersion
            }
          }
        }
        thumbnail_url = ''
        for (let keyImage of catalog_item.keyImages) {
          if (keyImage.type === 'Thumbnail') {
            thumbnail_url = keyImage.url
            break;
          }
        }

        let release_info = catalog_item.releaseInfo
        let ue_version = []

        if(Array.isArray(release_info)) {
          for (let info of release_info) {
            let compatibleApps = info.compatibleApps[0]
            if (compatibleApps) {
              ue_version.push(compatibleApps)
            }
          }
        }

        const catalog_row = await db.vault_library.where('catalogItemId').equals(catalog_item.id).first()
        if (catalog_row === undefined) {
          await db.vault_library.add({
            catalogItemId: catalog_item.id,
            description: catalog_item.description,
            title: catalog_item.title,
            thumbnail_url: thumbnail_url,
            lastModifiedDate: catalog_item.lastModifiedDate,
            buildVersion: buildVersion,
            ue_version: ue_version
          })
        } else {
          await db.vault_library.update(catalog_item.id, {
            description: catalog_item.description,
            title: catalog_item.title,
            thumbnail_url: thumbnail_url,
            lastModifiedDate: catalog_item.lastModifiedDate,
            buildVersion: buildVersion,
            ue_version: ue_version
          })
        }
      }
    },
    async loadGrid() {
      let user_settings = await db.user_settings.where("id").equals(1).first();
      if (user_settings !== null && user_settings !== undefined) {
        this.unreal_token = user_settings.unreal_token
        this.account_number = user_settings.account_number
        this.launcher_path = user_settings.launcher_path
        this.sniffer_path = user_settings.sniffer_path
        this.vault_cache_path = user_settings.vault_cache_path

        this.build_versions = await window.myNodeApi.get_build_versions(this.vault_cache_path)

        let catalogItems = await db.vault_library.toArray()
        this.rowData = await Promise.all(catalogItems.map(async catalogItem => {
          catalogItem.tags = await db.tags.where('id').anyOf([1]).toArray()
          if (Array.isArray(this.build_versions) === true && this.build_versions.length > 0) {
            catalogItem.updates_available = await this.getVaultUpdates(catalogItem)
          }
          return catalogItem
        }));

        this.rowCount = this.rowData.length

        if (this.updates === true) {
          this.showNotify('Updates available', 'secondary', 'top')
        }
       // console.log("row count" + this.rowCount)
        // this.qt.loading.hide()
      } else {
        this.showNotify('Please verify your settings tab information', 'negative', 'top', 'report_problem')
      }
    },
    async getVaultUpdates(catalogItem) {
      for (let build of this.build_versions) {
        if (catalogItem.catalogItemId === build.CatalogItemId) {
          if (catalogItem.buildVersion !== build.BuildVersionString) {
            this.updates = true
            return '1'
          } else {
            return '0'
          }
        }
      }
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
    async onCellValueChanged(event) {
      if (event.column.colId === 'comment') {
        await db.vault_library.update(event.data.catalogItemId, {
          comment: event.data.comment
        })
      }
      // if (event.column.colId === 'updates_available') {
      //   await db.vault_library.update(event.data.catalogItemId, {
      //     updates_available: event.data.updates_available
      //   })
      // }
    }
  }
}
</script>
