const express = require('express');
const randomstring = require('randomstring');
const mysql = require('mysql2');
const path = require('path');


const app = express();
// const mysql = require("mysql");
app.use(express.json());

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Pm@12345",
    database: "urls_storage"
});

con.connect(function (error) {
    if (error) {
        console.log("Database connection failed:", error);
        return;
    }
    console.log("Database connected successfully!");
});

// Serve static files from the "Frontend" directory
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.get("/", function (request, response) {
    // Serve the index.html file from the "Frontend" directory
    response.sendFile(path.join(__dirname, '..', 'Frontend', 'index.html'));
});

// Shorten URL and store in the database
function shorten(req, res) {
    const long_url = req.body.long_url;

    con.query('SELECT short_url FROM urls WHERE long_url = ?', [long_url], (error, results) => {
        if (error) {
            console.log("Database query failed:", error);
            return res.status(500).send({"error": "Database error"});
        }

        if (results.length > 0) {
            return res.status(200).send({"short_url": results[0].short_url});
        } else {
            let shortened_url = null;

            while (shortened_url == null) {
                shortened_url = randomstring.generate(5);
                con.query('SELECT long_url FROM urls WHERE short_url = ?', [shortened_url], (error, results) => {
                    if (results.length > 0) {
                        shortened_url = null; // Collision, generate a new one
                    }
                });
            }

            con.query('INSERT INTO urls (long_url, short_url) VALUES (?, ?)', 
            [long_url, shortened_url], 
            (error) => {
                if (error) {
                    console.log("Failed to insert URL into database:", error);
                    return res.status(500).send({"error": "Database error"});
                }
                res.status(200).send({"short_url": shortened_url});
            });
        }
    });
}

// Retrieve long URL from the database
function retrieveLongUrl(req, res) {
    const short_url = req.params.short_url; // Get short_url from the URL parameter

    con.query('SELECT long_url FROM urls WHERE short_url = ?', [short_url], (error, results) => {
        if (error) {
            console.log("Database query failed:", error);
            return res.status(500).send({"error": "Database error"});
        }

        if (results.length > 0) {
            res.redirect(results[0].long_url); // Redirect to the long URL
        } else {
            res.status(404).send({"error": "URL NOT FOUND"});
        }
    });
}

app.get('/:short_url', retrieveLongUrl);


app.post('/shorten', shorten);


const port = 3007;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
