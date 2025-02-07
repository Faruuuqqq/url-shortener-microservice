const express = require('express');
const mysql = require('mysql2');
const dns = require('dns');
const validUrl = require('valid-url');
const shortid = require('shortid');
const db = require('./db/connection');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/url', require('./routes/url'));

// Serve static files (frontend)
app.use(express.static('views'));

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));