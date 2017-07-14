const express = require('express');
const http = require('http');
const hbs = require('hbs');

var AWS = require('aws-sdk');


module.exports = function() {
    const port = 1234;
    const app = express();
    const httpServer = http.createServer(app);
    const applicationRoot = '../';
    const s3 = new AWS.S3();

    app
        .set('view engine', 'html')
        .set('views', `${__dirname}/${applicationRoot}views`)
        .engine('html', hbs.__express)
        .use("/static", express.static(`${__dirname}/${applicationRoot}static`))
        .get('/api/reports', (req, res) => s3.listObjectsV2({ Bucket: 'mort-reports' }, (err, data) => {
            res.json(data.Contents.map(object => {
                const nameRegex = /^P([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z)I([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z)T(.+)\.json$/;
                const matchedRegex = nameRegex.exec(object.Key).slice(1);
                const [postmortemDate, incidentDate, team] = matchedRegex;

                return {
                    key: object.Key,
                    postmortemDate: postmortemDate,
                    incidentDate: incidentDate,
                    team: team
                };
            }));
        }))
        .get(/^\/new/, (req, res) => {
            return res.render('new.hbs');
        })
        .get(/^\//, (req, res) => {
            return res.render('index.hbs');
        });

    return {
        start: () => new Promise(resolve => httpServer.listen(port, err => {
            console.log(`Mort online, listening on port: ${port}`);
            resolve();
        })),
        stop: () => Promise.resolve()
    }
};
