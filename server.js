/********************************************************************************
* WEB322 – Assignment 06 *
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy: *
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html *
* Name: Shanyun, Wang Student ID: 133159228 Date: 2024-04-19 *
* GitHub Repository URL: https://github.com/swang308/web.git
* Published URL: https://frail-underwear-bull.cyclic.app/
* ********************************************************************************/
const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');
const { error } = require('console');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Initialize Database
legoData.initialize()
  .then(() => console.log('Database initialized successfully.'))
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => res.render('index'));

app.get('/about', (req, res) => res.render('about'));

app.get('/lego/sets', async (req, res) => {
  try {
    const { theme } = req.query;
    const sets = theme ? await legoData.getSetsByTheme(theme) : await legoData.getAllSets();
    res.render('sets', { sets });
  } catch (err) {
    res.status(404).render("404", { message: error });
  }
});

app.get('/lego/sets/:setNum', async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.setNum);
    res.render('set', { set });
  } catch (err) {
    res.status(404).render("404", { message: error });
  }
});

app.get("/lego/addSet", async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes });
  } catch (error) {
    res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.post("/lego/addSet", async (req, res) => {
  try {
    await legoData.addSet(req.body);
    console.log("Set added successfully");
    res.redirect("/lego/sets");
  } catch (error) {
    res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/editSet/:setNum", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.setNum);
    const themes = await legoData.getAllThemes();
    res.render("editSet", { set, themes });
  } catch (error) {
    res.status(404).render("404", { message: error });
  }
});

app.post("/lego/editSet", async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (error) {
    res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

app.get("/lego/deleteSet/:num", async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (error) {
    res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

// Start Server
app.listen(HTTP_PORT, () => console.log(`Server is listening at http://localhost:${HTTP_PORT}`));
