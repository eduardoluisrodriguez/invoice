export const actions = {

    // Document
    fetchProductsByDocumentId: async ({ commit, dispatch, rootGetters, rootState }, id) => {
        const url = `${rootGetters['api/mainURL']}/documents`;
        const config = { ...rootGetters['api/config'], body: JSON.stringify({ id }) };
        const products = rootState.product.items;

        const documentProductsRaw = await dispatch('api/makeRequest', { url, config }, { root: true });

        const documentProducts = documentProductsRaw.map(
            (product) => ({
                ...product,
                product_name: products.get(product.product_id).name,
                isComestible: products.get(product.product_id).isComestible
            })
        );

        dispatch('setProducts', documentProducts);
    },  

    setProducts: ({ commit }, products) => {
        products.forEach(p => commit('ADD_PRODUCT', p));

        commit('TRACK_PRODUCTS');
    },

    // setId: ({ commit }, payload) => commit('SET_ID', payload),

    // Updated
    addUpdatedProduct: ({ commit, state }, { id = null, ...productDetails }) => {
        const currentUpdatedProduct = state.updatedProducts.get(id) || {};
                
        const newUpdatedProduct = { ...currentUpdatedProduct, ...productDetails };

        commit('ADD_UPDATED_PRODUCT', { id, ...newUpdatedProduct });
        commit('TRACK_UPDATED_PRODUCTS');
    },

    resetUpdatedProducts: ({ commit }) => {
        commit('RESET_UPDATED_PRODUCTS');
        commit('TRACK_UPDATED_PRODUCTS');
    },

    // Created
    addCreatedProduct: ({ commit }, { id, ...createdProductDetails }) => {
        commit('ADD_CREATED_PRODUCT', { id, ...createdProductDetails });
        commit('TRACK_CREATED_PRODUCTS');
    },

    deleteCreatedProduct: ({ commit }, id) => {
        commit('DELETE_CREATED_PRODUCT', id);
        commit('TRACK_CREATED_PRODUCTS');
    },

    resetCreatedProducts: ({ commit }) => {
        commit('RESET_CREATED_PRODUCTS');
        commit('TRACK_CREATED_PRODUCTS');
    },

    addFieldToCreatedProduct: ({ commit, state }, createdProductDetails) => {
        const [id, fieldName, fieldValue] = createdProductDetails;

        const currentCreatedProducts = state.createdProducts.get(id) || {};
        const modifiedProduct = { ...currentCreatedProducts, [fieldName]: fieldValue };

        commit('ADD_CREATED_PRODUCT', { id, ...modifiedProduct });
        commit('TRACK_CREATED_PRODUCTS');
    },

    // Deleted
    addDeletedProduct: ({ commit }, { id = null, ...deletedProductDetails }) => {
        commit('ADD_DELETED_PRODUCT', { id, ...deletedProductDetails });
        commit('TRACK_DELETED_PRODUCTS');

        commit('DELETE_PRODUCT', id);
        commit('TRACK_PRODUCTS');
    },

    resetDeletedProducts: ({ commit }) => {
        commit('RESET_DELETED_PRODUCTS');
        commit('TRACK_DELETED_PRODUCTS');
    },
    

    // updateItems: async ({ dispatch, rootState, rootGetters }, payload) => {
    //     dispatch('setAlreadyFetched', true);

    //     console.log('updating items!')
        
    //     const url = `${rootState.mainUrl}documents/update_products`
    //     const config = {
    //         ...rootGetters['api/config'], 
    //         method: "PUT",
    //         body: JSON.stringify(payload)
    //     }

    //     const response = await dispatch("api/makeRequest", { url, config }, { root: true });
    //     if (rootGetters['dashboard/getUpdateState']) {
    //         dispatch('dashboard/fetchMainOverview', 'dashboard/overview', { root: true });
    //     }
        
    //     await dispatch('api/FETCH_DATA', undefined, { root: true });
        
    //     return response;
    // },

    // deleteFromDoc: async ({ dispatch, commit, rootState, rootGetters, state }, id) => {
    //     const url = `${rootState.mainUrl}documents/delete_from_doc`;
    //     const config = { ...rootGetters['api/config'], method: "DELETE", body: JSON.stringify({ id, docId: state.currentId }) };
        
    },

    updateDocument: async ({ dispatch, state, rootState, rootGetters }, payload) => {
        const url = `${rootState.mainUrl}documents/update_document`;
        const config = {
            ...rootGetters['api/config'],
            method: "PUT",
            body: JSON.stringify(payload)
        }

        await dispatch('api/makeRequest', { url, config }, { root: true })
        
        if (!state.alreadyFetched) {
            await dispatch('api/FETCH_DATA', undefined, { root: true });
        } else {
            dispatch('setAlreadyFetched', false);
        }

        // let prevState = ``,
        //     currentState = ``;

        // Object.entries(changes).forEach(([key, value]) => {
        //     if (key !== 'provider_id') {
        //         prevState += `${key}:${this.currentDocument[key]}|`
        //         currentState += `${value}|`
        //     }
        // })

        // const message = `Update document information`;
        // this.$store.dispatch('dashboard/insertHistoryRow', {
        //     entity: `documents/edit/${this.id}`,
        //     message,
        //     action_type: 'update',
        //     prev_state: prevState.slice(0, -1),
        //     current_state: currentState.slice(0, -1),
        // });
    },

    // setAlreadyFetched: ({ commit }, payload) => commit('SET_ALREADY_FETCHED', payload),

    // resetDeletedItems: ({ commit }) => commit('RESET_DELETED_ITEMS'),
}