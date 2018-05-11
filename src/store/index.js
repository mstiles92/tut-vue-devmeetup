import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'
import firebaseConfig from '../config'
import meetup from './meetup'
import user from './user'
import shared from './shared'
import { Mutations, Actions } from './definitions'

Vue.use(Vuex)

firebase.initializeApp(firebaseConfig)

const plugins = [
    store => firebase.auth().onAuthStateChanged(user => {
        if (user) {
            store.commit(Mutations.SET_USER, {
                id: user.uid,
                registeredMeetups: [],
                fbKeys: {}
            })
            store.dispatch(Actions.FETCH_USER_DATA)
        } else {
            store.commit(Mutations.SET_USER, null)
        }
    })
]

export const store = new Vuex.Store({
    plugins,
    modules: {
        meetup: meetup,
        user: user,
        shared: shared
    }
})
