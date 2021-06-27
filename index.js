const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = 2020;
const App = express();


App.use(cors())
App.use(bodyParser.json())


App.use(express.static('public'))


const db = require('./database');
db.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack)
        return;
    }

    console.log('connected ID : ' + db.threadId);
});

const { parkingRouters } = require('./routers');

App.get('/', (req, res) => {
    res.status(200).send('<h1>Welcome to Parking System API</h1>')
})

App.use('/api', parkingRouters)


App.listen(PORT, () => console.log('Connected to Parking System API :', PORT))