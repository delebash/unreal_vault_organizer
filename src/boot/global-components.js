import {boot} from 'quasar/wrappers'
import SideNave from '../components/side-nav.vue'
import VaultGrid from '../components/vault-grid.vue'
import TagGridSelect from '../components/tag-grid-select.vue'
import {AgGridVue} from "ag-grid-vue3";
import mitt from 'mitt'
const eventBus = mitt()

export default boot(async ({app}) => {
  app.component('side-nav', SideNave)
  app.component('tag-grid-select', TagGridSelect)
  app.component('vault-grid', VaultGrid)
  app.component('ag-grid-vue', AgGridVue)
  app.config.globalProperties.eventBus = eventBus
})
