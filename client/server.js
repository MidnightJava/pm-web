let express = require('express');
let path = require('path');

const PORT = 3000;

let app = express();
let appDir = path.join(__dirname, 'build');

app.use(express.static(appDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'), err => {
        if (err) {
            res.status(500).send(err);
        }
    });
});

app.listen(PORT);