import * as firebase from 'firebase'
import { Mutations, Actions } from '../definitions'

const state = {
    loadedMeetups: []
}

const mutations = {
    [Mutations.SET_LOADED_MEETUPS](state, payload) {
        state.loadedMeetups = payload
    },
    [Mutations.CREATE_MEETUP](state, payload) {
        state.loadedMeetups.push(payload)
    },
    [Mutations.UPDATE_MEETUP](state, payload) {
        const meetup = state.loadedMeetups.find(meetup => meetup.id === payload.id)
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
    [Mutations.DELETE_MEETUP](state, payload) {
        const index = state.loadedMeetups.findIndex(meetup => meetup.id === payload)
        state.loadedMeetups.splice(index, 1)
    }
}

const actions = {
    [Actions.LOAD_MEETUPS]({commit}) {
        commit(Mutations.SET_LOADING, true)
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
                commit(Mutations.SET_LOADED_MEETUPS, meetups)
                commit(Mutations.SET_LOADING, false)
            })
            .catch(error => {
                console.log(error)
                commit(Mutations.SET_LOADING, false)
            })
    },
    [Actions.CREATE_MEETUP]({commit, getters}, payload) {
        commit(Mutations.SET_LOADING, true)
        return new Promise((resolve, reject) => {
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
                    commit(Mutations.SET_LOADING, false)
                    commit(Mutations.CREATE_MEETUP, {
                        ...meetup,
                        imageUrl,
                        id: key
                    })
                    resolve(key)
                })
                .catch(error => {
                    console.log(error)
                    commit(Mutations.SET_LOADING, false)
                    reject(error)
                })
        })
    },
    [Actions.UPDATE_MEETUP]({commit}, payload) {
        commit(Mutations.SET_LOADING, true)
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
                commit(Mutations.SET_LOADING, false)
                commit(Mutations.UPDATE_MEETUP, payload)
            })
            .catch(error => {
                console.log(error)
                commit(Mutations.SET_LOADING, false)
            })
    },
    [Actions.DELETE_MEETUP]({commit, getters}, payload) {
        commit(Mutations.SET_LOADING, true)
        firebase.database().ref(`/meetups/${payload}`).remove()
            .then(() => {
                const imageUrl = getters.loadedMeetup(payload).imageUrl
                return firebase.storage().refFromURL(imageUrl).delete()
            })
            .then(() => {
                commit(Mutations.DELETE_MEETUP, payload)
                commit(Mutations.SET_LOADING, false)
            })
            .catch(error => {
                console.log(error)
                commit(Mutations.SET_LOADING, false)
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
    }
}

const plugins = []

export default { state, mutations, actions, getters, plugins }
