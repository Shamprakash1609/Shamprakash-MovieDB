import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import axios from 'axios';
import env from 'dotenv';
import User from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;
env.config();

const OMDB_API_KEY = process.env.API_KEY; 
const connectionString = process.env.MONGODB_CONNECTION_STRING;

mongoose.connect( connectionString , {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB'))
  .catch(err => console.log("Connection Error", err));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.post('/register', async (req, res) => {
    const { fullname, email, username, password, age, gender } = req.body;

    console.log(`Registration Details - Full Name: ${fullname}, Email: ${email}, Username: ${username}, Password: ${password}, Age: ${age}, Gender: ${gender}`);

    try {
        const userExists = await User.findOne({ $or: [{ username }, { email }] });

        if (userExists) {
            console.log('Registration failed: User already exists.');
            return res.json({ success: false, message: 'User already exists.' });
        }

        const newUser = new User({ fullname, email, username, password, age, gender });
        await newUser.save();

        console.log('Registration successful:', { fullname, email, username });
        res.json({ success: true, message: 'Registration successful.' });
    } catch (error) {
        console.log('Error during registration:', error);
        res.json({ success: false, message: 'Registration failed.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(`Login Attempt - Username: ${username}, Password: ${password}`);

    try {
        const user = await User.findOne({ username });

        if (user && user.password === password) {
            console.log('Login successful:', { username });
            res.json({ success: true });
        } else {
            console.log('Login failed: Invalid credentials.');
            res.json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.log('Error during login:', error);
        res.json({ success: false, message: 'Login failed.' });
    }
});

app.get('/user-data', async (req, res) => {
    try {
        const data = await User.find();
        res.status(200).json(data);
    } catch (error) {
        console.log('Error fetching user data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user data.' });
    }
});

app.get('/api/movies', async (req, res) => {
    const query = req.query.s;
    const movieId = req.query.i;

    let url = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;

    if (query) {
        url += `&s=${query}`;
    } else if (movieId) {
        url += `&i=${movieId}`;
    }

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from OMDB API:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch data from OMDB API.' });
    }
});

// Endpoint for movie search
app.get('/search', async (req, res) => {
    const { query } = req.query;

    try {
        const response = await axios.get(`http://www.omdbapi.com/?s=${query}&apikey=48aa722f`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch movies.' });
    }
});

// Endpoint for single movie details
app.get('/movie/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(`http://www.omdbapi.com/?i=${id}&apikey=48aa722f`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch movie details.' });
    }
});

// In-memory array to store favorite movie IDs
let favoriteIds = [];

// Endpoint to add a movie ID to favorites
app.post('/favorites/add', (req, res) => {
    const { id } = req.body;

    if (!id || favoriteIds.includes(id)) {
        return res.status(400).json({ success: false, message: 'Invalid or duplicate ID.' });
    }

    favoriteIds.push(id);
    res.json({ success: true, message: 'Movie ID added to favorites.' });
});

// Endpoint to remove a movie ID from favorites
app.post('/favorites/remove', (req, res) => {
    const { id } = req.body;

    if (!id || !favoriteIds.includes(id)) {
        return res.status(400).json({ success: false, message: 'ID not found in favorites.' });
    }

    favoriteIds = favoriteIds.filter(favId => favId !== id);
    res.json({ success: true, message: 'Movie ID removed from favorites.' });
});

// Endpoint to get all favorite movies
app.get('/favorites', async (req, res) => {
    try {
        const movieRequests = favoriteIds.map(id => axios.get(`http://www.omdbapi.com/?i=${id}&apikey=48aa722f`));
        const responses = await Promise.all(movieRequests);
        const movies = responses.map(response => response.data);
        res.json(movies);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch favorite movies.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
