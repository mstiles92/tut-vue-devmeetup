import * as firebase from 'firebase'
import { Mutations, Actions } from '../definitions'

const state = {
    loadedMeetups: []
}

const mutations = {
    [Mutations.SET_LOADED_MEETUPS](state, payload) {
        state.loadedMeetups = payload
    }
}

const actions = {
    [Actions.CREATE_MEETUP]({commit, getters}, payload) {
        commit(Mutations.SET_LOADING, true)
        return new Promise((resolve, reject) => {
            const meetup = {
                title: payload.title,
                location: payload.location,
                description: payload.description,
                date: payload.date.toISOString(),
                creatorId: getters.user.id,
                creatorName: getters.user.email
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
            })
            .catch(error => {
                console.log(error)
                commit(Mutations.SET_LOADING, false)
            })
    },
    [Actions.DELETE_MEETUP]({commit, getters}, payload) {
        commit(Mutations.SET_LOADING, true)
        const imageUrl = getters.loadedMeetup(payload).imageUrl
        firebase.database().ref(`/meetups/${payload}`).remove()
            .then(() => {
                return firebase.storage().refFromURL(imageUrl).delete()
            })
            .then(() => {
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
        return state.loadedMeetups
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

const plugins = [
    store => firebase.database().ref('meetups').orderByChild('date').on('value', snapshot => {
        const meetups = []
        snapshot.forEach(childSnapshot => {
            const obj = childSnapshot.val()
            meetups.push({
                id: childSnapshot.key,
                title: obj.title,
                description: obj.description,
                imageUrl: obj.imageUrl,
                date: obj.date,
                location: obj.location,
                creatorId: obj.creatorId,
                creatorName: obj.creatorName
            })
        })
        store.commit(Mutations.SET_LOADED_MEETUPS, meetups)
    })
]

export default { state, mutations, actions, getters, plugins }
