const express = require('express');
const parkingControllers = require('../controllers/parkingControllers');
const route = express.Router();

route.get('/lotAvailable', parkingControllers.getLotData)
route.post('/register', parkingControllers.register)
route.post('/checkout', parkingControllers.checkout)
route.get('/tipeMobil', parkingControllers.tipeMobil)
route.get('/nomorWarna', parkingControllers.nomorWarna)

module.exports = route