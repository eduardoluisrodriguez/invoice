import Vue from 'vue'
import Vuex from 'vuex'

import * as product from './modules/products';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        everythingReady: null,
    },
    mutations: {
        CHANGE_STATE: (state, payload) => state.everythingReady = payload
    },
    actions: {

    },

    modules: {
        product
    }
})
