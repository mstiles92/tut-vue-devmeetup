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
    setLoadedMeetups(state, payload) {
        state.loadedMeetups = payload
    },
    createMeetup(state, payload) {
        state.loadedMeetups.push(payload)
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
                imageUrl = fileData.metadata.downloadURLs[0]
                return firebase.database().ref('meetups').child(key).update({ imageUrl: imageUrl })
            })
            .then(() => {
                commit('createMeetup', {
                    ...meetup,
                    imageUrl: imageUrl,
                    id: key
                })
            })
            .catch(error => {
                console.log(error)
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
                registeredMeetups: []
            })
        } else {
            store.commit('setUser', null)
        }
    })
]

firebase.initializeApp(firebaseConfig)

export const store = new Vuex.Store({ state, mutations, actions, getters, plugins })
