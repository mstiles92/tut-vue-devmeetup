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
    }
}

const mutations = {
    createMeetup(state, payload) {
        state.loadedMeetups.push(payload)
    },
    setUser(state, payload) {
        state.user = payload
    }
}

const actions = {
    createMeetup({commit}, payload) {
        const meetup = {
            title: payload.title,
            location: payload.location,
            imageUrl: payload.imageUrl,
            description: payload.description,
            date: payload.date,
            id: new Date().valueOf().toString()
        }

        // TODO: Reach out to firebase and store it

        commit('createMeetup', meetup)
    },
    signUserUp({commit}, payload) {
        firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
            .catch(error => {
                console.log(error)
            })
    },
    signUserIn({commit}, payload) {
        firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
            .catch(error => {
                console.log(error)
            })
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
