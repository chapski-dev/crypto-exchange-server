let express = require('express');
let axios = require('axios');

let router = express.Router();

const BASE_URL = "https://pro-api.coinmarketcap.com/v1";

const API_KEY = process.env.API_KEY;


/* GET listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.use('/cryptocurrency/map', async function (req, res){
  try {
    console.log('API_KEY', process.env.API_KEY);
    const response = await axios.get(`${BASE_URL}/cryptocurrency/map`, {
        headers: { "X-CMC_PRO_API_KEY": API_KEY },
    });
    res.json(response.data);  // ✅ Отправляем JSON
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
})


async function getCryptoPrice(symbol) {
  try {
      const response = await axios.get(`${BASE_URL}/cryptocurrency/quotes/latest`, {
          headers: { 'X-CMC_PRO_API_KEY': API_KEY },
          params: { symbol, convert: 'USD' }
      });

      return response.data.data[symbol].quote.USD.price;
  } catch (error) {
      console.error(`Ошибка при получении курса ${symbol}:`, error.response?.data || error.message);
      return null;
  }
}

async function getExchangeRate(fromCurrency, toCurrency) {

  const fromCurrencyPrice = await getCryptoPrice(fromCurrency);
  const toCurrencyPrice = await getCryptoPrice(toCurrency);

  if (fromCurrencyPrice && toCurrencyPrice) {
    return {
      tiker_from_price: fromCurrencyPrice,
      tiker_to_price: toCurrencyPrice,
      exchange_rate: fromCurrencyPrice/toCurrencyPrice
    };
  }
  
  return null;
}


router.use('/exchange-rate', async function (req, res){
  try {
    const { fromCurrency, toCurrency } = req.query
    const response = await getExchangeRate(fromCurrency, toCurrency)
    console.log('getExchangeRate response', response);
    res.json(response);  // ✅ Отправляем JSON
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
})



module.exports = router;
