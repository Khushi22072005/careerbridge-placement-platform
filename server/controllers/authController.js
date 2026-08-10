const pool = require("../src/config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        // await pool.query(
        //     `INSERT INTO users(name, email, password)
        //      VALUES($1, $2, $3)`,
        //     [fullname, email, hashedPassword]
        // );
        await pool.query(
            `INSERT INTO users(fullname, email, password, role)
             VALUES($1, $2, $3, $4)`,
            [fullname, email, hashedPassword, 'student']
        );

        res.json({
            message: "Registration Successful"
        });

    } catch (err) {
        console.error("Registration Error:", err);

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

        const token = jwt.sign(
            {
                id: user.rows[0].id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login Successful",
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email,
                created_at: user.rows[0].created_at
            }
        });

    } catch (err) {
        console.error("Login Error:", err);

        res.status(500).json({
            message: err.message
        });
    }
};