import * as firebase from 'firebase'
import { Mutations, Actions } from '../definitions'

const state = {
    user: null
}

const mutations = {
    [Mutations.REGISTER_USER_FOR_MEETUP](state, payload) {
        const id = payload.id
        if (state.user.registeredMeetups.findIndex(meetup => meetup === id) > 0) {
            return
        }
        state.user.registeredMeetups.push(id)
        state.user.fbKeys[id] = payload.fbKey
    },
    [Mutations.UNREGISTER_USER_FROM_MEETUP](state, payload) {
        const registeredMeetups = state.user.registeredMeetups
        registeredMeetups.splice(registeredMeetups.findIndex(meetup => meetup === payload.id), 1)
        Reflect.deleteProperty(state.user.fbKeys, payload)
    },
    [Mutations.SET_USER](state, payload) {
        state.user = payload
    }
}

const actions = {
    [Actions.REGISTER_USER_FOR_MEETUP]({commit, getters}, payload) {
        commit(Mutations.SET_LOADING, true)
        const user = getters.user
        firebase.database().ref(`/users/${user.id}/registrations`)
            .push(payload)
            .then(data => {
                commit(Mutations.SET_LOADING, false)
                commit(Mutations.REGISTER_USER_FOR_MEETUP, {
                    id: payload,
                    fbKey: data.key
                })
            })
            .catch(error => {
                console.log(error)
                commit(Mutations.SET_LOADING, false)
            })
    },
    [Actions.UNREGISTER_USER_FROM_MEETUP]({commit, getters}, payload) {
        commit(Mutations.SET_LOADING, true)
        const user = getters.user
        if (!user.fbKeys) {
            return
        }
        const fbKey = user.fbKeys[payload]
        firebase.database().ref(`/users/${user.id}/registrations/${fbKey}`)
            .remove()
            .then(() => {
                commit(Mutations.SET_LOADING, false)
                commit(Mutations.UNREGISTER_USER_FROM_MEETUP, payload)
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
    [Actions.FETCH_USER_DATA]({commit, getters}) {
        commit(Mutations.SET_LOADING, true)
        firebase.database().ref(`/users/${getters.user.id}/registrations`).once('value')
            .then(data => {
                const dataPairs = data.val()
                let registeredMeetups = []
                let swappedPairs = {}
                for (let key in dataPairs) {
                    registeredMeetups.push(dataPairs[key])
                    swappedPairs[dataPairs[key]] = key
                }
                const updatedUser = {
                    id: getters.user.id,
                    registeredMeetups: registeredMeetups,
                    fbKeys: swappedPairs
                }
                commit(Mutations.SET_LOADING, false)
                commit(Mutations.SET_USER, updatedUser)
            })
            .catch(error => {
                console.log(error)
                commit(Mutations.SET_LOADING, false)
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

export default { state, mutations, actions, getters, plugins }
