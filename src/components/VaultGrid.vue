<template>
  <q-chip v-show="updates" color="yellow-9" text-color="white">
    Updates Available
  </q-chip>

  <ag-grid-vue
    style="width: 100%; height: 100%; margin-bottom: 100px"
    class="ag-theme-alpine"
    id="myGrid"
    :refreshCells="true"
    :columnDefs="columnDefs"
    @grid-ready="onGridReady"
    :defaultColDef="defaultColDef"
    :rowData="rowData"
    :getRowNodeId="getRowNodeId"
    :valueCache="true"
    :overlayLoadingTemplate="overlayLoadingTemplate"
    @cell-value-changed="onCellValueChanged"
    @selection-changed="onSelectionChanged"
    @first-data-rendered="onFirstDataRendered">
  </ag-grid-vue>
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
import {api} from '../api/api'
import TagGridSelect from '../components/TagGridSelect.vue'
import CheckboxGrid from '../components/CheckboxGrid.vue'
import TitleImageGrid from '../components/TitleImageGrid.vue'
import CustomFilter from '../components/CustomFilter.vue';

const $q = useQuasar()
let additional_row_info = []
let build_versions = []
let updates = false
let vault_cache_path = ''
const columnDefs = ref([])

const rowCount = 0
const gridApi = shallowRef();
const rowData = ref([])
let getRowNodeId = ref(null)
let selectedRowId = ref(null)
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
    autoHeight: true,
    cellRenderer: 'TitleImageGrid',
    // cellRenderer: function (params) {
    // let title = params.data.title;
    // let myTitle = `<div>${title}</div>`;
    // return myTitle;
    // }
  },
  // {
  //   headerName: "Image",
  //   editable: false,
  //   width: 90,
  //   autoHeight: true,
  //   field: "asset.images[0]?.url",
  //   // cellRenderer: function (params) {
  //   //   let thumbnail_url = params.data.asset?.images[0]?.url;
  //   //   let url = params.data.asset?.url
  //   //     let img = `<a href=${url} target="_blank"><img  width="500px" height="50px" src= ${thumbnail_url}>`;
  //   //   return img;
  //   // }
  // },
  {
    headerName: "Description",
    field: "asset.description",
    editable: false,
    autoHeight: true,
    wrapText: true,
    width: 300
  },
  {
    headerName: 'Tags',
    field: 'tagIds',
    autoHeight: true,
    editable: false,
    cellRenderer: 'TagGridSelect',
    width: 270
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
    cellRenderer: 'CheckboxGrid',
    width: 165,
  },
  // {
  //   headerName: 'Last Modified Data',
  //   field: 'lastModifiedDate',
  //   editable: false,
  //   width: 200,
  // },
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
  },

];

const rowSelection = {
  mode: 'singleRow',
};
const overlayLoadingTemplate =
  '<span class="ag-overlay-loading-center">Please wait while your rows are loading. This could take a minute to refresh your data.</span>';

async function importVault() {
  await api.importVault();
  await loadVault()
}

function testMatch() {
  console.log('testMatch')
}

const onFilterTextBoxChanged = (filterValue) => {
  gridApi.value.setGridOption(
    "quickFilterText",
    filterValue
  );
};

async function loadVault() {
  rowData.value = await api.loadVault();
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

async function getVaultUpdates(catalogItem) {
  for (let build of build_versions) {
    if (catalogItem.catalogItemId === build.CatalogItemId) {
      if (catalogItem.buildVersion !== build.BuildVersionString) {
        updates = true
        return '1'
      } else {
        return '0'
      }
    }
  }
}

function onSelectionChanged() {
  let selectedRows = gridApi.value.getSelectedRows();
  selectedRows.forEach(function (selectedRow, index) {
    selectedRowId.value = selectedRow.asset.assetId;
  })
}

async function onGridReady(params) {
  gridApi.value = params.api;
  await loadVault()
}

function onFirstDataRendered(params) {
  // params.api.sizeColumnsToFit();
}

async function onCellValueChanged(event) {
  if (event.column.colId === 'comment') {
    await api.updateVaultAsset(event.data.assetId, {
      comment: event.data.comment
    })
  }
  if (event.column.colId === 'updates_available') {
    await api.updateVaultAsset(event.data.assetId, {
      updates_available: event.data.updates_available
    })
  }
}

defineExpose({
    loadVault,
    importVault,
    filterRows,
    onFilterTextBoxChanged,
    CustomFilter,
    TagGridSelect,
    CheckboxGrid,
    TitleImageGrid
  }
)
</script>
