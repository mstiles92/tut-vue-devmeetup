import * as firebase from 'firebase'
import { Mutations, Actions } from '../definitions'

const state = {
    user: null
}

const mutations = {
    [Mutations.SET_USER](state, payload) {
        state.user = payload
    },
    [Mutations.SET_USER_REGISTRATIONS](state, payload) {
        if (state.user) {
            state.user.registeredMeetups = payload
        }
    }
}

const actions = {
    [Actions.REGISTER_USER_FOR_MEETUP]({commit, getters}, payload) {
        commit(Mutations.SET_LOADING, true)
        const user = getters.user
        firebase.database().ref(`/users/${user.id}/registrations/${payload}`)
            .set(true)
            .then(() => {
                commit(Mutations.SET_LOADING, false)
            })
            .catch(error => {
                console.log(error)
                commit(Mutations.SET_LOADING, false)
            })
    },
    [Actions.UNREGISTER_USER_FROM_MEETUP]({commit, getters}, payload) {
        commit(Mutations.SET_LOADING, true)
        const user = getters.user
        firebase.database().ref(`/users/${user.id}/registrations/${payload}`)
            .remove()
            .then(() => {
                commit(Mutations.SET_LOADING, false)
            })
            .catch(error => {
                console.log(error)
                commit(Mutations.SET_LOADING, false)
            })
    },
    [Actions.SIGN_USER_UP]({commit}, payload) {
        commit(Mutations.SET_LOADING, true)
        commit(Mutations.CLEAR_ERROR)
        firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
            .then(() => {
                commit(Mutations.SET_LOADING, false)
            })
            .catch(error => {
                commit(Mutations.SET_LOADING, false)
                commit(Mutations.SET_ERROR, error)
                console.log(error)
            })
    },
    [Actions.SIGN_USER_IN]({commit}, payload) {
        commit(Mutations.SET_LOADING, true)
        commit(Mutations.CLEAR_ERROR)
        firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
            .then(() => {
                commit(Mutations.SET_LOADING, false)
            })
            .catch(error => {
                commit(Mutations.SET_LOADING, false)
                commit(Mutations.SET_ERROR, error)
                console.log(error)
            })
    },
    [Actions.LOGOUT]() {
        firebase.auth().signOut()
    }
}

const getters = {
    user(state) {
        return state.user
    }
}

const plugins = [
    store => firebase.auth().onAuthStateChanged(newUser => {
        const oldUser = store.getters.user
        if (oldUser) {
            firebase.database().ref(`/users/${oldUser.id}/registrations`).off()
        }
        if (newUser) {
            store.commit(Mutations.SET_USER, {
                id: newUser.uid,
                registeredMeetups: []
            })
            firebase.database().ref(`/users/${newUser.uid}/registrations`).on('value', snapshot => {
                if (snapshot.exists()) {
                    store.commit(Mutations.SET_USER_REGISTRATIONS, Object.keys(snapshot.val()))
                } else {
                    store.commit(Mutations.SET_USER_REGISTRATIONS, [])
                }
            })
        } else {
            store.commit(Mutations.SET_USER, null)
        }
    })
]

export default { state, mutations, actions, getters, plugins }
