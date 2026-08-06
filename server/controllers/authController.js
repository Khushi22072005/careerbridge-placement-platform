const pool = require("../src/config/db");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {

    try {

        const { fullname, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users(fullname,email,password,role)
             VALUES($1,$2,$3,$4)`,
            [fullname, email, hashedPassword, role]
        );

        res.json({
            message: "Registration Successful"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (user.rows.length === 0) {

            return res.status(400).json({
                message: "User Not Found"
            });

        }

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!validPassword) {

            return res.status(400).json({
                message: "Wrong Password"
            });

        }

        res.json({
            message: "Login Successful",
            user: user.rows[0]
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};