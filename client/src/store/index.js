import Vue from 'vue'
import Vuex from 'vuex'

import * as api from './modules/api';
import * as document_product from './modules/document_product';
import * as dashboard from './modules/dashboard';

Vue.use(Vuex)

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    
    state: {
        everythingReady: null,
        currentEntity: null,
        selectedProvider: null,
        mainUrl: 'http://localhost:3000/',
    },

    getters: {
        getEntityName: state => state.currentEntity.slice(0, -1),

        getEntityNewItems: state => {
            const entityName = state.currentEntity.slice(0, -1)
            
            if (state[entityName]) 
                return state[entityName].newItems
        },

        getEntityItems: (state, getters) => {
            return state[getters.getEntityName].items
        }
    },

    mutations: {
        CHANGE_STATE: (state, payload) => state.everythingReady = payload,
        ADD_ITEM: (_, { state, prop, payload }) => state[prop].push(payload),
        CHANGE_ENTITY: (state, payload) => state.currentEntity = payload,
        SET_PROVIDER: (state, payload) => state.selectedProvider = payload,
        SET_PROVIDER_INVOICE_NR: (state, payload) => state.selectedProvider = { ...state.selectedProvider, invoiceNr: payload }
    },

    actions: {
        changeEntity: ({ commit }, payload) => commit('CHANGE_ENTITY', payload),
    },

    modules: {
        api,
        document_product,
        dashboard
    }
});

// Every time the user updates an item, changes the values locally, but also make a db call to have the new results on refresh etc..
// TODO: refactor a little bit
store.subscribeAction(action => {
    const currentEntity = store.state.currentEntity && store.state.currentEntity.slice(0, -1) || null

    // Re-fetch main overview from Dashboard on: create / delete / update
    if (['api/insertItem', 'document_product/updateItems', 'document_product/deleteFromDoc', 'api/deleteItem'].includes(action.type)) {
        let willUpdate = true;

        // Check if there is any update that is significant to the main overview 
        if (action.type === 'document_product/updateItems') {
            willUpdate = false;

            for (const objValues of Object.values(action.payload)) {
                if (objValues.hasOwnProperty('sell_price'))
                    willUpdate = true;
            }
        }

        willUpdate && store.commit('dashboard/SET_UPDATE_STATE', true);
    }

    if (currentEntity && action.type === `${currentEntity}/updateItems`) {
        
        const data = {
            url: `${store.state.mainUrl}${currentEntity}s`,
            payload: action.payload
        }

        store.dispatch(`api/updateItem`, data)

    } else if (action.type === `${currentEntity}/deleteItem` && action.payload.prop === 'items') {
        
        const data = {
            url: `${store.state.mainUrl}${currentEntity}s`,
            payload: action.payload.id
        }

        store.dispatch('api/deleteItem', data);
    } else if (action.type === 'dashboard/setNewVat') {
        // Updating VAT 
        const config = {
            ...store.getters['api/config'], 
            method: "PUT",
            body: JSON.stringify({ [action.payload.type]: action.payload.value })
        }
        const url = `${store.getters['api/mainURL']}/vat/update`;
        
        store.dispatch('api/makeRequest', { url, config });
    }
})

store.watch(
    state => {
        return [state.document_product.items, state.document_product.lastDeletedDocId]
    },
    async ([dpItems, lastDeletedDocId]) => {
        const currentEntity = store.state.currentEntity

        if (!dpItems.length && lastDeletedDocId !== -1) {
            const data = {
                url: `${store.state.mainUrl}${currentEntity}`,
                payload: lastDeletedDocId
            }

            await store.dispatch('api/deleteItem', data);
            store.dispatch('api/FETCH_DATA');
        }
    }
)

export default store;