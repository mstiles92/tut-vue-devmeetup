import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import colors from 'vuetify/es5/util/colors'
import { store } from './store'
import DateFilter from './filters/date'
import AlertCmp from './components/shared/Alert.vue'
import MeetupCard from './components/shared/MeetupCard'
import EditMeetupDetailsDialog from './components/meetup/edit/EditMeetupDetailsDialog'
import EditMeetupDateDialog from './components/meetup/edit/EditMeetupDateDialog'
import EditMeetupTimeDialog from './components/meetup/edit/EditMeetupTimeDialog'
import RegisterDialog from './components/meetup/registration/RegisterDialog'
import DeleteMeetupDialog from './components/meetup/edit/DeleteMeetupDialog'

// Make firebase accessible from devtools console
import * as firebase from 'firebase'
window.firebase = firebase

Vue.use(Vuetify, {
    theme: {
        primary: colors.orange.base,
        secondary: colors.orange.lighten3,
        accent: colors.lightGreen.lighten1
    }
})

Vue.config.productionTip = false

Vue.filter('date', DateFilter)
Vue.component('app-alert', AlertCmp)
Vue.component('app-meetup-card', MeetupCard)
Vue.component('app-edit-meetup-details-dialog', EditMeetupDetailsDialog)
Vue.component('app-edit-meetup-date-dialog', EditMeetupDateDialog)
Vue.component('app-edit-meetup-time-dialog', EditMeetupTimeDialog)
Vue.component('app-meetup-register-dialog', RegisterDialog)
Vue.component('app-delete-meetup-dialog', DeleteMeetupDialog)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})
