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
                        date: obj[key].date
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
    createMeetup({commit}, payload) {
        const meetup = {
            title: payload.title,
            location: payload.location,
            imageUrl: payload.imageUrl,
            description: payload.description,
            date: payload.date.toISOString()
        }

        firebase.database().ref('meetups').push(meetup)
            .then(data => {
                const key = data.key
                commit('createMeetup', {
                    ...meetup,
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
