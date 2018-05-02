import Vue from 'vue'
import Vuex from 'vuex'
import * as moment from 'moment'
import * as firebase from 'firebase'
import firebaseConfig from '../config'

Vue.use(Vuex)

const state = {
    loadedMeetups: [
        {
            imageUrl: 'https://i.ytimg.com/vi/MtCMtC50gwY/maxresdefault.jpg',
            id: '0001',
            title: 'New York Meetup',
            date: moment('2017-07-17'),
            location: 'New York',
            description: 'New York, New York'
        },
        {
            imageUrl: 'https://i.ytimg.com/vi/_FYKIhJZdaI/maxresdefault.jpg',
            id: '0002',
            title: 'Paris Meetup',
            date: moment('2017-07-19'),
            location: 'Paris',
            description: 'Paris!'
        }
    ],
    user: {
        id: 'aaaa',
        registeredMeetups: ['0001']
    },
    loading: false,
    error: null
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
    setLoadedMeetups(state, payload) {
        state.loadedMeetups = payload
    },
    createMeetup(state, payload) {
        state.loadedMeetups.push(payload)
    },
    updateMeetup(state, payload) {
        const meetup = state.loadedMeetups.find(meetup => {
            return meetup.id === payload.id
        })
        if (payload.title) {
            meetup.title = payload.title
        }
        if (payload.description) {
            meetup.description = payload.description
        }
        if (payload.date) {
            meetup.date = payload.date
        }
    },
    setUser(state, payload) {
        state.user = payload
    },
    setLoading(state, payload) {
        state.loading = payload
    },
    setError(state, payload) {
        state.error = payload
    },
    clearError(state) {
        state.error = null
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
    loadMeetups({commit}) {
        commit('setLoading', true)
        firebase.database().ref('meetups').once('value')
            .then(data => {
                const meetups = []
                const obj = data.val()
                for (let key in obj) {
                    meetups.push({
                        id: key,
                        title: obj[key].title,
                        description: obj[key].description,
                        imageUrl: obj[key].imageUrl,
                        date: obj[key].date,
                        location: obj[key].location,
                        creatorId: obj[key].creatorId
                    })
                }
                commit('setLoadedMeetups', meetups)
                commit('setLoading', false)
            })
            .catch(error => {
                console.log(error)
                commit('setLoading', false)
            })
    },
    createMeetup({commit, getters}, payload) {
        const meetup = {
            title: payload.title,
            location: payload.location,
            description: payload.description,
            date: payload.date.toISOString(),
            creatorId: getters.user.id
        }

        let imageUrl
        let key

        firebase.database().ref('meetups').push(meetup)
            .then(data => {
                key = data.key
                return key
            })
            .then(key => {
                const filename = payload.image.name
                const ext = filename.slice(filename.lastIndexOf('.') + 1)
                return firebase.storage().ref(`meetups/${key}.${ext}`).put(payload.image)
            })
            .then(fileData => {
                return fileData.ref.getDownloadURL()
            })
            .then(downloadUrl => {
                imageUrl = downloadUrl
                return firebase.database().ref('meetups').child(key).update({ imageUrl })
            })
            .then(() => {
                commit('createMeetup', {
                    ...meetup,
                    imageUrl,
                    id: key
                })
            })
            .catch(error => {
                console.log(error)
            })
    },
    updateMeetupData({commit}, payload) {
        commit('setLoading', true)
        const updateObj = {}
        if (payload.title) {
            updateObj.title = payload.title
        }
        if (payload.description) {
            updateObj.description = payload.description
        }
        if (payload.date) {
            updateObj.date = payload.date.toISOString()
        }
        firebase.database().ref('meetups').child(payload.id).update(updateObj)
            .then(() => {
                commit('setLoading', false)
                commit('updateMeetup', payload)
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
    },
    clearError({commit}) {
        commit('clearError')
    }
}

const getters = {
    loadedMeetups(state) {
        return state.loadedMeetups.sort((meetupA, meetupB) => {
            return meetupA.date > meetupB.date
        })
    },
    featuredMeetups(state, getters) {
        return getters.loadedMeetups.slice(0, 5)
    },
    loadedMeetup(state) {
        return (meetupId) => {
            return state.loadedMeetups.find((meetup) => {
                return meetup.id === meetupId
            })
        }
    },
    user(state) {
        return state.user
    },
    loading(state) {
        return state.loading
    },
    error(state) {
        return state.error
    }
}

const plugins = [
    store => firebase.auth().onAuthStateChanged(user => {
        if (user) {
            store.commit('setUser', {
                id: user.uid,
                registeredMeetups: [],
                fbKeys: {}
            })
            store.dispatch('fetchUserData')
        } else {
            store.commit('setUser', null)
        }
    })
]

firebase.initializeApp(firebaseConfig)

export const store = new Vuex.Store({ state, mutations, actions, getters, plugins })
