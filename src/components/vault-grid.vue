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
<script setup>
import {ref, shallowRef} from 'vue'
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional Theme applied to the Data Grid
import {AgGridVue} from "ag-grid-vue3"; // Vue Data Grid Component
import {useQuasar} from 'quasar'
import lodash from 'lodash'
import {eventBus} from 'boot/global-components.js'
// import {api} from '../api/api'
import {db} from '../db.js'

const $q = useQuasar()
let additional_row_info = []
let build_versions = ref([])
let updates = ref(false);
const columnDefs = ref([])
let tag_info_options = ref([])
const rowCount = ref()
const gridApi = shallowRef();
const rowData = ref([])
let getRowNodeId = ref(null)
let selectedRowId = ref(null)
const unreal_token = ref('')
const account_number = ref('')
const vault_cache_path = ref('')
const defaultColDef = {
  width: 150,
  sortable: true,
  editable: true,
  resizable: true,
  filter: true
}

columnDefs.value = [
  {
    headerName: "Asset Id",
    field: "asset.assetID",
    editable: false,
    hide: true
  },
  {
    headerName: "Title",
    field: "asset.title",
    sort: 'asc',
    editable: false,
    wrapText: true,
    width: 300,
    // cellRenderer: function (params) {
    //   let title = params.data.title;
    //   let myTitle = `<div>${title}</div>`;
    //   return myTitle;
    // }
  },
  {
    headerName: "Image",
    editable: false,
    width: 90,
    autoHeight: true,
    field: "image",
    cellRenderer: function (params) {
      let thumbnail_url = params.data.asset?.images[0].url;
      let url = params.data.asset?.url
      //    let Marketplace_url = "https://www.unrealengine.com/marketplace/en-US/item/" + params.data.catalogItemId;
      //let launcher_url = "com.epicgames.launcher://ue/marketplace/item/" + params.data.catalogItemId;
      let img = `<a href=${url} target="_blank"><img  width="75" height="75" src= ${thumbnail_url}>`;
      return img;
    }
  },
  {
    headerName: "Description",
    field: "asset.description",
    editable: false,
    autoHeight: true,
    wrapText: true,
    width: 300
  },
  // {
  //   headerName: 'Tags',
  //   field: 'tags',
  //   autoHeight: true,
  //   editable: false,
  //   cellRenderer: 'tag-grid-select',
  //   width: 270,
  // },
  {
    headerName: "Comment",
    field: "comment",
    wrapText: true,
    width: 300,
    cellEditor: 'agLargeTextCellEditor'
  },
  // {
  //   headerName: 'Updates Available',
  //   field: 'updates_available',
  //   autoHeight: true,
  //   editable: false,
  //   cellRenderer: 'checkbox-grid',
  //   width: 165,
  // },
  // {
  //   headerName: 'Last Modified Data',
  //   field: 'lastModifiedDate',
  //   editable: false,
  //   width: 200,
  // },
  // {
  //   headerName: 'Build Version',
  //   field: 'buildVersion',
  //   editable: false,
  //   width: 270,
  // },
  // {
  //   headerName: 'Compatible Version',
  //   field: 'ue_version',
  //   editable: false,
  //   width: 270,
  // },

];

const rowSelection = {
  mode: 'singleRow',
};
const overlayLoadingTemplate =
  '<span class="ag-overlay-loading-center">Please wait while your rows are loading. This could take a minute to refresh your data.</span>';
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


async function importVault() {
  await api.importVault();
  await loadVault()
}

async function loadVault() {

  let data = await api.loadVault();
  // console.log(data);
  rowData.value = data
}

function showNotify(msg, color, position, icon) {
  $q.notify({
    message: msg,
    color: color,
    position: position,
    icon: icon
  })
}

function filterRows(args) {
  rowData.value = args.rows;
}

async function downloadVault() {
  $q.loading.show()

  let user_settings = await db.user_settings.where("id").equals(1).first();
  if (user_settings !== null && user_settings !== undefined) {
    unreal_token.value = user_settings.unreal_token
    account_number.value = user_settings.account_number
    vault_cache_path.value = user_settings.vault_cache_path

    let catalog_url = 'https://catalog-public-service-prod06.ol.epicgames.com/catalog/api/shared/namespace/ue/bulk/items?includeDLCDetails=false&includeMainGameDetails=false&country=US&locale=en'
    let entitlement_url = 'https://entitlement-public-service-prod08.ol.epicgames.com/entitlement/api/account/' + account_number.value + '/entitlements'
    let assets_url = 'https://launcher-public-service-prod06.ol.epicgames.com/launcher/api/public/assets/Windows?label=Live'
    let fetch_options = {}
    fetch_options.method = 'GET'
    fetch_options.headers = {
      'Authorization': 'bearer ' + unreal_token.value,
      'Content-Type': 'application/json'
    }

    fetch_options.url = assets_url
    let assets = await window.myNodeApi.api_fetch(fetch_options)
    //  let assets = await window.myNodeApi.get_ue_vault(fetch_options)
    // console.log(assets)
    let count_params, start = 0, count = 1000

    //loop 20 times or until entitlements count = 0 this should load 20,000 assets if someone has that many
    for (let i = 0; i <= 20; i++) {
      fetch_options.method = 'GET'
      fetch_options.headers = {
        'Authorization': 'bearer ' + unreal_token.value,
        'Content-Type': 'application/json'
      }
      count_params = '?start=' + start + '&count=' + count
      fetch_options.url = entitlement_url + count_params
      let entitlements = await window.myNodeApi.api_fetch(fetch_options)
      // console.log(entitlements)
      if (Array.isArray(entitlements) === true && entitlements.length > 0) {
        await getCatalogItems(catalog_url, entitlements, assets)
        start = start + count
      } else if (i > 0 && entitlements.length === 0) {
        break;
      } else if (i === 0 && entitlements.length === 0) {
        showNotify('Please request a new token', 'negative', 'top', 'report_problem')
        $q.loading.hide()
        break;
      } else {
        if (entitlements.errorCode) {
          showNotify('Please request a new token', 'negative', 'top', 'report_problem')
          $q.loading.hide()
          break;
        }
        break;
      }
    }
    await loadGrid()
    $q.loading.hide()
  } else {
    showNotify('Please verify your settings tab information', 'negative', 'top', 'report_problem')
    $q.loading.hide()
  }
}

async function getCatalogItems(catalog_url, entitlements, assets) {
  let start = 0, entitlements_length = entitlements.length || [], response, form_body = '',
    thumbnail_url = '', buildVersion = ''
  let fetch_options = {}
  fetch_options.method = 'POST'
  fetch_options.headers = {
    'Authorization': 'bearer ' + unreal_token.value,
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
  console.log(items)
  for (let catalog_item of Object.values(items)) {

    //Get all build versions for asset
    if (catalog_item.id === catalog_item.id) {
      let assetsById = assets.filter(asset => asset.catalogItemId === catalog_item.id)
      //Get latest build version for asset.
      let orderedVersions = lodash.orderBy(assetsById, ['buildVersion'], ['desc']);
      let version = orderedVersions[0]
      if (version) {
        buildVersion = version.buildVersion
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

    if (Array.isArray(release_info)) {
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
}

async function loadGrid() {
  let user_settings = await db.user_settings.where("id").equals(1).first();
  if (user_settings !== null && user_settings !== undefined) {
    unreal_token.value = user_settings.unreal_token
    account_number.value = user_settings.account_number
    vault_cache_path.value = user_settings.vault_cache_path
    updates.value = false
    build_versions.value = await window.myNodeApi.get_build_versions(vault_cache_path.value)
    let catalogItems = await db.vault_library.toArray()
    rowData.value = await Promise.all(catalogItems.map(async catalogItem => {
      catalogItem.tags = await db.tags.where('id').anyOf([1]).toArray()
      if (Array.isArray(build_versions.value) === true && build_versions.value.length > 0) {
        catalogItem.updates_available = await getVaultUpdates(catalogItem)
      }
      return catalogItem
    }));

    rowCount.value = rowData.value.length

    if (updates.value === true) {
      showNotify('Updates available', 'secondary', 'top')
    }

    $q.loading.hide()
  } else {
    showNotify('Please verify your settings tab information', 'negative', 'top', 'report_problem')
  }
}

async function getVaultUpdates(catalogItem) {
  for (let build of build_versions.value) {
    if (catalogItem.catalogItemId === build.CatalogItemId) {
      if (catalogItem.buildVersion !== build.BuildVersionString) {
        updates.value = true
        return '1'
      } else {
        return '0'
      }
    }
  }
}

function onSelectionChanged() {
  let that = this
  let selectedRows = gridApi.getSelectedRows();
  selectedRows.forEach(function (selectedRow, index) {
    that.selectedRowId = selectedRow.catalogItemId;
  })
}

async function onGridReady(params) {
  gridApi.value = params.api;
  // gridColumnApi = params.columnApi;
}

function onFirstDataRendered(params) {
  // params.api.sizeColumnsToFit();
}

async function onCellValueChanged(event) {
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
</script>
