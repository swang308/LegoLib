const setData = require("../data/setData");
const themeData = require("../data/themeData");
// let sets = [];

require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/lego-sets",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

  const themeSchema = new mongoose.Schema({
    id: String,
    name: String,
  });
  
  const setSchema = new mongoose.Schema({
    set_num: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    year: String,
    num_parts: String,
    theme_id: String,
    img_url: String,
  });
  
  const Theme = mongoose.model("Theme", themeSchema);
  const Set = mongoose.model("Set", setSchema);
  module.exports = {
    Theme,
    Set,
  };
  
  async function initialize() {
    try {
      // Check if there are any themes in the database
      const themesCount = await Theme.countDocuments();
      if (themesCount === 0) {
        // Populate themes from themeData if database is empty
        await Theme.insertMany(themeData);
        console.log("Themes initialized in database.");
      }
  
      // Check if there are any sets in the database
      const setsCount = await Set.countDocuments();
      if (setsCount === 0) {
        // Populate sets from setData if database is empty
        await Set.insertMany(setData);
        console.log("Sets initialized in database.");
      }
  
      console.log("Database initialization complete.");
    } catch (err) {
      console.error("Error initializing database:", err);
      throw err;
    }
  }
  
  async function getAllSets() {
    try {
      const sets = await Set.find().populate("theme_id");
      return sets;
    } catch (err) {
      console.error("Error getting all sets:", err);
      throw err;
    }
  }
  
  async function getAllThemes() {
    try {
      const themes = await Theme.find();
      return themes;
    } catch (err) {
      console.error("Error getting all themes:", err);
      throw err;
    }
  }
  
  async function getSetByNum(setNum) {
    try {
      const foundSet = await Set.findOne({ set_num: setNum }).populate(
        "theme_id"
      );
      if (!foundSet) {
        throw new Error("Set not found");
      }
      return foundSet;
    } catch (err) {
      console.error("Error getting set by set number:", err);
      throw err;
    }
  }
  
  async function getSetsByTheme(theme) {
    try {
      return await Set.findAll({
        include: Theme,
        where: { '$Theme.name$': { [Op.iLike]: `%${theme}%` } }
      });
    } catch (error) {
      throw new Error('Error fetching sets by theme: ' + error.message);
    }
  }
  
  async function addSet(setData) {
    try {
      const newSet = await Set.create(setData);
      return newSet;
    } catch (err) {
      console.error("Error adding set:", err);
      throw err;
    }
  }
  
  async function editSet(setNum, setData) {
    try {
      const updatedSet = await Set.findOneAndUpdate(
        { set_num: setNum },
        setData,
        { new: true }
      );
      if (!updatedSet) {
        throw new Error("Set not found");
      }
      return updatedSet;
    } catch (err) {
      console.error("Error editing set:", err);
      throw err;
    }
  }
  
  async function deleteSet(setNum) {
    try {
      const deletedSet = await Set.findOneAndDelete({ set_num: setNum });
      if (!deletedSet) {
        throw new Error("Set not found");
      }
      return deletedSet;
    } catch (err) {
      console.error("Error deleting set:", err);
      throw err;
    }
  }
  
  module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    getAllThemes,
    addSet,
    editSet,
    deleteSet,
  };