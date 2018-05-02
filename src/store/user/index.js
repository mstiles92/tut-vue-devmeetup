import * as firebase from 'firebase'

const state = {
    user: null
}

const mutations = {
    registerUserForMeetup(state, payload) {
        const id = payload.id
        if (state.user.registeredMeetups.findIndex(meetup => meetup.id === id) > 0) {
            return
        }
        state.user.registeredMeetups.push(id)
        state.user.fbKeys[id] = payload.fbKey
    },
    unregisterUserFromMeetup(state, payload) {
        const registeredMeetups = state.user.registeredMeetups
        registeredMeetups.splice(registeredMeetups.findIndex(meetup => meetup.id === payload.id), 1)
        Reflect.deleteProperty(state.user.fbKeys, payload)
    },
    setUser(state, payload) {
        state.user = payload
    }
}

const actions = {
    registerUserForMeetup({commit, getters}, payload) {
        commit('setLoading', true)
        const user = getters.user
        firebase.database().ref(`/users/${user.id}`).child('registrations')
            .push(payload)
            .then(data => {
                commit('setLoading', false)
                commit('registerUserForMeetup', {
                    id: payload,
                    fbKey: data.key
                })
            })
            .catch(error => {
                console.log(error)
                commit('setLoading', false)
            })
    },
    unregisterUserFromMeetup({commit, getters}, payload) {
        commit('setLoading', true)
        const user = getters.user
        if (!user.fbKeys) {
            return
        }
        const fbKey = user.fbKeys[payload]
        firebase.database().ref(`/users/${user.id}/registrations`).child(fbKey)
            .remove()
            .then(() => {
                commit('setLoading', false)
                commit('unregisterUserFromMeetup', payload)
            })
            .catch(error => {
                console.log(error)
                commit('setLoading', false)
            })
    },
    signUserUp({commit}, payload) {
        commit('setLoading', true)
        commit('clearError')
        firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
            .then(() => {
                commit('setLoading', false)
            })
            .catch(error => {
                commit('setLoading', false)
                commit('setError', error)
                console.log(error)
            })
    },
    signUserIn({commit}, payload) {
        commit('setLoading', true)
        commit('clearError')
        firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
            .then(() => {
                commit('setLoading', false)
            })
            .catch(error => {
                commit('setLoading', false)
                commit('setError', error)
                console.log(error)
            })
    },
    fetchUserData({commit, getters}) {
        commit('setLoading', true)
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
                commit('setLoading', false)
                commit('setUser', updatedUser)
            })
            .catch(error => {
                console.log(error)
                commit('setLoading', false)
            })
    },
    logout() {
        firebase.auth().signOut()
    }
}

const getters = {
    user(state) {
        return state.user
    }
}

export default { state, mutations, actions, getters }
