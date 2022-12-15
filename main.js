const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const resizer = require("node-image-resizer");
const fs = require('fs');

const app = express();
const port = 8000;

let COMPRESSION_DONE = false;

/* Config */
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* Compress images & cache */

const SETUP = {
    all: {
        path: "compressed/",
        quality: 25
    },
    versions: [
        {
            prefix: "",
            width: 1920,
            height: 1080
        }
    ]
};

const directoryPath = "./images";

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    files.forEach(async (file) => {
        // compress
        await resizer(`./images/${file}`, SETUP);

        // setup endpoint
        app.get(`/get-images/${file}`, async (req, res) => {
            let { compressionPercentage } = req.query;

            if (compressionPercentage === undefined) {
                compressionPercentage = 20;
            }

            res.download(`./compressed/${file}`);
        });

        console.log("DONE | " + file);
    });
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));