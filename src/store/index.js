import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    loadedMeetups: [
        {
            imageUrl: 'https://i.ytimg.com/vi/MtCMtC50gwY/maxresdefault.jpg',
            id: '0001',
            title: 'New York Meetup',
            date: '2017-07-17'
        },
        {
            imageUrl: 'https://i.ytimg.com/vi/_FYKIhJZdaI/maxresdefault.jpg',
            id: '0002',
            title: 'Paris Meetup',
            date: '2017-07-19'
        }
    ],
    user: {
        id: 'aaaa',
        registeredMeetups: ['0001']
    }
}

const mutations = {

}

const actions = {

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
    }
}

export const store = new Vuex.Store({ state, mutations, actions, getters })
