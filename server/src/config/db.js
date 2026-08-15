// const { Pool } = require("pg");

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT
// });

// module.exports = pool;

const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on("connect", async (client) => {
    try {
        const result = await client.query(`
            SELECT
                current_database() AS database,
                current_schema() AS schema,
                current_user AS user
        `);

        console.log("=================================");
        console.log("POSTGRESQL CONNECTION");
        console.log("Database:", result.rows[0].database);
        console.log("Schema:", result.rows[0].schema);
        console.log("User:", result.rows[0].user);
        console.log("=================================");
    } catch (error) {
        console.error("Database connection check failed:", error.message);
    }
});

module.exports = pool;