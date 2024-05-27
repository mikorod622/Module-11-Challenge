const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');  // Imported uuid to generate unique IDs

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // to serve the front end files

// HTML routes
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

// API routes
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    newNote.id = uuidv4(); // assign a unique id to the new note

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes' });
        } else {
            const notes = JSON.parse(data);
            notes.push(newNote);

            fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to save note' });
                } else {
                    res.json(newNote);
                }
            });
        }
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes' });
        } else {
            const notes = JSON.parse(data);
            const updatedNotes = notes.filter(note => note.id !== id);

            fs.writeFile('./db/db.json', JSON.stringify(updatedNotes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to delete note' });
                } else {
                    res.json({ success: true });
                }
            });
        }
    });
});

app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));
