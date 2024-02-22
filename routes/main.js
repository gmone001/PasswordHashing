module.exports = function(app, shopData) {

    const bcrypt = require('bcrypt');
    app.get('/', function(req, res) {
        res.render('index.ejs', shopData);
    });

    app.get('/about', function(req, res) {
        res.render('about.ejs', shopData);
    });

    app.get('/search', function(req, res) {
        res.render("search.ejs", shopData);
    });

    app.get('/search-result', function(req, res) {
        let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'";
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, { availableBooks: result });
            res.render("list.ejs", newData);
        });
    });

    app.get('/register', function(req, res) {
        res.render('register.ejs', shopData);
    });

    app.post('/registered', function(req, res) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;

        bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
            let sqlquery = "INSERT INTO Users (Username, firstname, lastname, hashedPassword) VALUES (?, ?, ?, ?)";
            let newrecord = [req.body.username, req.body.firstname, req.body.lastname, hash];

            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return console.error(err.message);
                }
                res.send('Hello ' + req.body.firstname + ' ' + req.body.lastname + ', you are now registered!');
            });
        });
    });
    

    app.get('/addbook', function(req, res) {
        res.render('addbook.ejs', shopData);
    });

    app.post('/bookadded', function(req, res) {
        let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
        let newrecord = [req.body.name, req.body.price];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            res.send('This book is added to the database, name: ' + req.body.name + ' price ' + req.body.price);
        });
    });

    app.get('/bargainbooks', function(req, res) {
        let sqlquery = "SELECT * FROM books WHERE price < 20";
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, { availableBooks: result });
            res.render("bargains.ejs", newData);
        });
    });

    // Update the listusers route to render list.ejs and pass users data
    app.get('/listusers', function(req, res) {
        let sqlquery = "SELECT Username, firstname, lastname FROM Users"; // Query database to get all users (excluding passwords)
        db.query(sqlquery, (err, users) => {
            if (err) {
                console.error(err.message);
                res.redirect('./');
            } else {
                let userData = Object.assign({}, shopData, { users: users });
                res.render("listusers.ejs", userData);
            }
        });
    });
  
    app.get('/login', function(req, res) {
    res.render('login.ejs');
});
app.post('/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    //query database to check if username and password match
    let sqlquery = "SELECT * FROM Users WHERE Username = ?";
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            console.error(err.message);
            res.redirect('./login');
        } else {
            if (result.length > 0) {
                //user found in database check password
                const hashedPassword = result[0].hashedPassword;
                bcrypt.compare(password, hashedPassword, function(err, result) {
                    if (result) {
                        res.send('Login successful!');
                    } else {
                        res.send('Incorrect username or password.');
                    }
                });
            } else {
                res.send('User not found.');
            }
        }
    });
});
app.get('/loggedin', function(req, res) {
    //if the login was successful based on a query parameter or session variable
    const loginSuccessful = req.query.success === 'true'; // Example query parameter for login success

    //render the loggedin.ejs template with data to display appropriate messages
    res.render('loggedin.ejs', { loginSuccessful: loginSuccessful });
});

app.post('/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    let sqlQuery = "SELECT hashedPassword FROM Users WHERE Username = ?";
    db.query(sqlQuery, [username], (err, result) => {
        if (err) {
            console.error(err.message);
            res.redirect('./login');
        } else {
            if (result.length > 0) {
                const hashedPassword = result[0].hashedPassword;
                bcrypt.compare(password, hashedPassword, (err, result) => {
                    if (err) {
                        console.error(err.message);
                        res.redirect('./login');
                    } else {
                        if (result === true) {
                            // Redirect to a loggedin page after successful login
                            res.redirect('/loggedin?success=true');
                        } else {
                            // Redirect to a loggedin page with login failure indicator
                            res.redirect('/loggedin?success=false');
                        }
                    }
                });
            } else {
                //Redirect to a logged-in page with login failure indicator
                res.redirect('/loggedin?success=false');
            }
        }
    });
});
};