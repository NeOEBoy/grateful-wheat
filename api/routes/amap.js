const express = require('express');
const router = express.Router();
const httpErrors = require('http-errors');
const fetch = require('node-fetch');

/**
 * 配置数据-高德
 */
const KAMapConfig = {
    // 正式地址
    key: '54bf172ce1e262374c55674ab39b7674'
}

const KGeocodeUrl = "https://restapi.amap.com/v3/geocode/geo";

router.get('/', function (req, res, next) {
    next(httpErrors(403, 'Forbidden'));
});

router.get('/geocode', async function (req, res, next) {
    try {
        console.log('geocode start');

        let address = req.query.address;
        let city = req.query.city;

        let geocode = await geoCode(encodeURI(address), encodeURI(city));
        if (geocode.status == 1 && geocode.geocodes.length >= 1) {
            let location = geocode.geocodes[0].location;
            res.send({ errCode: 0, location: location });
            return;
        }

        res.send({ errCode: -1 });
    } catch (err) {
        next(err);
    }
});

geoCode = async (address, city) => {
    const geocodeUrl = `${KGeocodeUrl}?key=${KAMapConfig.key}&address=${address}&city=${city}`;
    const response = await fetch(geocodeUrl);
    const json = await response.json();
    return json;
};

module.exports = router;
