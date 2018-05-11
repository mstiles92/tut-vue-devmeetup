import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'
import firebaseConfig from '../config'
import meetup from './meetup'
import user from './user'
import shared from './shared'

Vue.use(Vuex)

firebase.initializeApp(firebaseConfig)

const plugins = [
    ...meetup.plugins,
    ...user.plugins
]

export const store = new Vuex.Store({
    plugins,
    modules: {
        meetup: meetup,
        user: user,
        shared: shared
    }
})
