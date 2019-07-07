import { convertMapToObjForAPI } from '@/utils/';

export const actions = {

    addCreatedItem: ({ commit }, payload) => {
        commit('ADD_CREATED_ITEM', payload);
        commit('TRACK_CREATED_ITEMS');
    },

    resetCreatedItems: ({ commit }) => {
        commit('RESET_CREATED_ITEMS');
        commit('TRACK_CREATED_ITEMS');
    },

    deleteCreatedItem: ({ commit }, rowId) => {
        commit('DELETE_CREATED_ITEM', rowId);
        commit('TRACK_CREATED_ITEMS');
    },

    /**
     * TODO: improvement
     * receive the new inserted row ids from the BE,
     * and append them to the existing items
     * 
     * Current behavior:
     * after items are inserted, **another** request is made to fetch again 
     * all the existing items;
     */
    insertCreatedItems: ({ dispatch, getters, rootGetters }) => {
        const createdItemsAsArr = getters.getCreatedItemsAsArr;
        const createItemsWithoutId = createdItemsAsArr.map(({ id, ...rest }) => rest);
        const entityNameSingularForm = rootGetters['getEntityNameSingularForm'];
        const entityNamePluralForm = rootGetters['getEntityNamePluralForm'];

        return dispatch('api/insertItem', createdItemsAsArr, { root: true })
            .then(() => {
                
                const message = `Add new ${createdItemsAsArr.length === 1 ? entityNameSingularForm : entityNamePluralForm}`;
                
                dispatch('dashboard/insertHistoryRow', {
                    entity: entityNamePluralForm, 
                    message, 
                    action_type: 'insert',
                    current_state: JSON.stringify(createItemsWithoutId),
                }, { root: true });
            })
    },

    // TODO: add test
    addFieldValue: ({ commit, state }, { rowId, fieldName, value }) => {
        const newCurrentItem = state.createdItems.get(rowId) || {};
        const modifiedItem = { ...newCurrentItem, [fieldName]: value };

        commit('ADD_CREATED_ITEM', { id: rowId, ...modifiedItem });
        commit('TRACK_CREATED_ITEMS');
    },

    updateItem: ({ state, commit }, { id, ...updatedItemDetails }) => {
        const currentUpdatedItem = state.updatedItems.get(id) || {};
                
        const newUpdatedItem = { ...currentUpdatedItem, ...updatedItemDetails };

        commit('ADD_UPDATED_ITEM', { id, ...newUpdatedItem });
        commit('TRACK_UPDATED_ITEMS');
    },

    sendUpdatedItems: async ({ commit, dispatch, state, rootGetters }) => {
        console.log('updating items');
        const url = rootGetters['getEntityBackendEndpoint'];
        const payload = convertMapToObjForAPI(state.updatedItems);
        
        return await dispatch('api/makePUTRequest', {
            url, payload
        }, { root: true });
    },

    resetUpdatedItems: ({ commit }) => {
        commit('RESET_UPDATED_ITEMS');
        commit('TRACK_UPDATED_ITEMS');
    },

    deleteItem: ({ state, commit }, id) => {
        const deletedItem = state.items.get(id);

        commit('DELETE_ITEM', id);
        commit('TRACK_ITEMS');
        commit('ADD_DELETED_ITEM', { id, ...deletedItem });
        commit('TRACK_DELETED_ITEMS');
    },

    setItems: ({ commit, dispatch, rootGetters }, payload) => {
        payload.forEach(({ id, ...item }) => commit('ADD_ITEM', { id, ...item }))
        commit('TRACK_ITEMS');

        if (rootGetters['dashboard/getUpdateState']) {
            dispatch('dashboard/fetchMainOverview', 'dashboard/overview', {
                root: true
            });
        }
    },
}