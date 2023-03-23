const express = require('express');
const request = require('request-promise');
// const cheerio = require('cheerio');
// const axios = require('axios');
const puppeteer = require('puppeteer');


const app = express();
const PORT = process.env.PORT || 8080;

const generateScraperUrl = (apiKey) => `https://api.scraperapi.com?api_key=${apiKey}&autoparse=true`;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Amazon Data Scrapper API.'); 
});

//---------------------------------------------------------------------------
app.get('/amazon/products/:productId', async(req, res) => {
    const { productId } = req.params;
    const url = `https://www.amazon.fr/dp/${productId}`
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    // Navigate to Amazon product page
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    await page.waitForSelector('body');

    const product = await page.evaluate (() => {
        // Get product title 
        let title = document.body.querySelector('#productTitle').innerHTML;

        // Get review count
        let reviewCount = document.body.querySelector('#acrCustomerReviewText').innerText;
        let formattedReviewCount = reviewCount.replace(/[^0-9]/g,'').trim();

        // Get and format rating
        let ratingElement = document.body.querySelector('.a-icon.a-icon-star').getAttribute('class');
        let integer = ratingElement.replace(/[^0-9]/g,'').trim();
        let parsedRating = parseInt(integer) / 10;

        // Get availability
        let availability = document.body.querySelector('#availability').innerText; 
        let formattedAvailability = availability.replace(/[^0-9]/g, '').trim();

        // Get price
        let price = document.body.querySelector('apexPriceToPay').innerText;

        // // Get product description
        // let description = document.body.querySelector('#renewedProgramDescriptionAtf').innerText;

        // // Get product features
        // let features = document.body.querySelectorAll('#feature-bullets ul li');
        // let formattedFeatures = [];

        // features.forEach((feature) => {
        //     formattedFeatures.push(feature.innerText);
        // });

        // // Get comparable items
        // let comparableItems = document.body.querySelectorAll('#HLCXComparisonTable .comparison_table_image_row .a-link-normal');                
        // formattedComparableItems = [];

        // comparableItems.forEach((item) => {
        //     formattedComparableItems.push("https://amazon.com" + item.getAttribute('href'));
        // });

        
        var product = { 
            "title": title,
            "reviewCount" : formattedReviewCount,
            "rating": parsedRating,
            "availability": formattedAvailability,
            "price": price,
            // "description": description,
            // "features": formattedFeatures,
            // "comparableItems": formattedComparableItems
        };

        return product;
    })

    console.log(product);
    
    await browser.close();

    // const { api_key } = req.query;
    // const url = `${generateScraperUrl(api_key)}&url=https://www.aliexpress.com/item/${productId}.html`;
    // console.log('url    ' + url);

    // try {
    //     const response = await request(url);
    //     console.log('response   ' + response.data);
    //     res.json(JSON.parse(response));
    //     // res.json(response.data);

    // } catch (error) {
    //     res.json(error);
    // }
});


//---------------------------------------------------------------------------

// GET Product Details
app.get('/aliexpress/products/:productId', async(req, res) => {
    const { productId } = req.params;
    const { api_key } = req.query;
    const url = `${generateScraperUrl(api_key)}&url=https://www.aliexpress.com/item/${productId}.html`;
    console.log('url    ' + url);

    try {
        const response = await request(url);
        console.log('response   ' + response.data);
        res.json(JSON.parse(response));
        // res.json(response.data);

    } catch (error) {
        res.json(error);
    }
});
//---------------------------------------------------------------------------

// GET Product Details
app.get('/products/:productId', async(req, res) => {
    const { productId } = req.params;
    const { api_key } = req.query;
    const url = `${generateScraperUrl(api_key)}&url=https://www.amazon.com/dp/${productId}`;
    console.log('url    ' + url);

    try {
        const response = await request(url);
        res.json(JSON.parse(response));

    } catch (error) {
        res.json(error);
    }
});

// GET Product Reviews
app.get('/products/:productId/reviews', async(req, res) => {
    const { productId } = req.params;
    const { api_key } = req.query;

    try {
        const response = await request(`${generateScraperUrl(api_key)}&url=https://www.amazon.com/product-reviews/${productId}`);
        res.json(JSON.parse(response));

    } catch (error) {
        res.json(error);
    }
});

// GET Product Offers
app.get('/products/:productId/offers', async(req, res) => {
    const { productId } = req.params;
    const { api_key } = req.query;

    try {
        const response = await request(`${generateScraperUrl(api_key)}&url=https://www.amazon.com/gp/offer-listing/${productId}`);
        res.json(JSON.parse(response));

    } catch (error) {
        res.json(error);
    }
});

// GET Search Results
app.get('/search/:searchQuery', async(req, res) => {
    const { searchQuery } = req.params;
    const { api_key } = req.query;

    try {
        const response = await request(`${generateScraperUrl(api_key)}&url=https://www.amazon.com/s?k=${searchQuery}`);
        res.json(JSON.parse(response));

    } catch (error) {
        res.json(error);
    }
});

app.listen(PORT, () => {
    console.log(process);
   console.log(`Server running on port ${PORT}`);
});