import {boot} from 'quasar/wrappers'
import mitt from 'mitt'

const eventBus = mitt()

export default boot(async ({app}) => {

})

export { eventBus }
