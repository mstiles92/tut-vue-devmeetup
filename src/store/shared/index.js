import { Mutations, Actions } from '../definitions'

const state = {
    loading: false,
    error: null
}

const mutations = {
    [Mutations.SET_LOADING](state, payload) {
        state.loading = payload
    },
    [Mutations.SET_ERROR](state, payload) {
        state.error = payload
    },
    [Mutations.CLEAR_ERROR](state) {
        state.error = null
    }
}

const actions = {
    [Actions.CLEAR_ERROR]({commit}) {
        commit(Mutations.CLEAR_ERROR)
    }
}

const getters = {
    loading(state) {
        return state.loading
    },
    error(state) {
        return state.error
    }
}

export default { state, mutations, actions, getters }
