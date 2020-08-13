const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json()); // is middleware. Middleware basically a fn that can modify
// incoming request data. Bodye ulaşabiliriz


// TOP LEVEL CODE ONLY EXECUTED ONCE
// only read at the begging when we start the server(tours-simple.json)
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// Always should specify the version of API
app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        // Jsend
        status: 'success',
        results: tours.length, // this is not a Jsend, this is make sense whenever we are sending an array(multiple obj)
        data: {
            tours
        }
    });
});

app.post('/api/v1/tours', (req, res) => {
    // console.log(req.body);  gonna be avaible on the req BC we used middleware

    const newId = tours[tours.length - 1].id + 1; // data
    // This is allow us to craete a new object by merging two existing objects together
    const newTour = Object.assign({ id: newId, }, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`App running on ${PORT}...`);
});
