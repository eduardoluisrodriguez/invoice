export const capitalize = ([first, ...rest]) => `${first.toUpperCase()}${rest.join('')}`

// eslint-disable-next-line
export const getRidOfObjProp = (obj, prop, { [prop]: _, ...rest } = obj) => rest

/**
 * @example
 * returns "30/03/2019"
 * formDate("2019-03-30T15:34:59.000Z")
 */
export const formatDate = dateStr => dateStr.replace(/(?<year>\d{4})\-(?<month>\d{2})\-(?<day>\d{2})([a-zA-Z:0-9.]+)/, '$<day>/$<month>/$<year>')

// Not using arrow function because we need to bind `this`(Vue instance)
export const fetchExcelFile = async function (url, rowIndex, id) {
    let link;
    
    if (!this.allItems.length) {
        await this.fetchById(id);
    }

    const config = {
        headers: new Headers({
           'Content-type': 'application/json',
           'responseType': 'arraybuffer'
       }),
       method: "POST",
       body: JSON.stringify({
           fileType: 'excel', 
           id, 
           vat: this.$store.getters['dashboard/getCurrentVat'],
           products: this.documentProducts,
        })
   }
    
    return fetch(url, config)
        .then(res => res.arrayBuffer())
        .then(res => {

            const blob = new Blob([res], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});

            link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `document${rowIndex + 1}.xlsx`;
            link.click();
            link = null;
        })
        .finally(() => {
            link = null;
        })
}

export const formatColumnName = column => column.split('_').map(capitalize).join(' ');