import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import colors from 'vuetify/es5/util/colors'
import { store } from './store'
import DateFilter from './filters/date'

Vue.use(Vuetify, {
    theme: {
        primary: colors.orange.base,
        secondary: colors.orange.lighten3,
        accent: colors.lightGreen.lighten1
    }
})

Vue.config.productionTip = false

Vue.filter('date', DateFilter)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})
