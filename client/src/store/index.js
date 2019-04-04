import Vue from 'vue'
import Vuex from 'vuex'

import * as api from './modules/api';
import * as document_product from './modules/document_product';
import * as dashboard from './modules/dashboard';

import { capitalize } from '../utils/'; 

Vue.use(Vuex)

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    
    state: {
        everythingReady: null,
        currentEntity: null,
        selectedProvider: null,
        // FIXME: use the URL from api/getters
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

    // Add to History table
    /* 
    api/makeRequest (able to get the changes) 
    - vat: { update }
    - products: { insert, update, delete }
    - providers: { insert, update, delete }
    - documents: { insert, delete, update_doc, update_prod }
    */
   if (action.type === 'api/makeRequest') {
       const { url, config: { body } } = action.payload
       let dataFromURL = null, entityName = null, entityAction = null;
       
       if (typeof body === 'undefined') return;
       console.log(action)

       // The URL might not have an action
       // i.e: when fetching: <mainUrl>/entity/ 
       try {
           dataFromURL = (new RegExp(`${store.state.mainUrl}([a-z]+)/([a-z_]+)`)).exec(url);
           entityName = dataFromURL[1];
           entityAction = dataFromURL[2];
       } catch {
           return;
       }  

       if (entityName === 'history') return;

       console.log(entityAction)
        
        // Table and action
        // Determine if entityName ends with 's'
        // console.log(entityName)
        // console.log(entityAction)

        let message = ``;

        if (entityAction === 'update') {
            message = `${capitalize(entityAction)} ${entityName}`
        } else if (!entityAction.includes('_')) {
            message = entityName.endsWith('s') && store.getters[`getEntityItems`].length === 1 && entityAction === 'delete' 
                ? `${entityName} is now empty.`
                : `${capitalize(entityAction)} ${entityAction === 'delete' ? 'from' : 'into'} ${entityName}`
        } else {
            const separatorIndex = entityAction.indexOf('_');
            const theAction = entityAction.slice(0, separatorIndex);
            const otherEntity = entityAction.slice(separatorIndex + 1);
            
            // /document/delete_from_doc || /document/update_document
            message = otherEntity !== 'document' 
                ? `${theAction} ${otherEntity.includes('_') ? 'product' : otherEntity} in ${entityName}`
                : `${theAction} document information ${JSON.stringify(body)}`
        }

        const entity = entityName;
        const action_type = entityAction;

        const insertURL = `${store.getters['api/mainURL']}/history/insert`;
        const config = {
            ...store.getters['api/config'],
            body: JSON.stringify({ entity, message, action_type })
        }

        store.dispatch('api/makeRequest', { url: insertURL, config });
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