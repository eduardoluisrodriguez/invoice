// TODO: DRY try-catch

const mockData = require('../mock');

class Service {
    constructor (name) {
        const dbName = require('../db')[`${name}DB`];
        this.db = new dbName();

        this.response = {};
    }

    // Business Logic
    async insertOne (params) {
        this.response = {};

        try {
            await this.db.insertOne(params);
            
            this.response = {
                message: `Inserted into ${this.tableName} successfully`,
                status: 200
            }
        } catch (err) {
            this.response = {
                message: `Failed to insert into ${this.tableName}`,
                status: 400
            }
        }

        return this.response;
    }

    async getAll () {
        this.response = {};

        try {
            // const data = await this.db.getAll();
            const data = mockData.products;

            this.response = {
                message: `Fetched from ${this.db.tableName} successfully`,
                status: 200,
                data
            }
        } catch (err) {
            this.response = {
                message: `Failed to fetch from ${this.db.tableName}`,
                status: 400
            }
        }

        return this.response;
    }

    async selectOneByID (params) {
        this.response = {};

        try {
            const data = await this.db.selectOneByID(params);

            this.response = {
                message: `Fetched one single item from ${this.db.tableName} successfully`,
                status: 200,
                data
            }
        } catch (err) {
            this.response = {
                message: `Failed to fetch a single item from ${this.db.tableName}`,
                status: 400
            }
        }

        return this.response;
    }
}

module.exports = Service;