const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

const url= 'https://www.inquirer.net'

async function scrapeInquirerLinks() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const linkElements = $('div#tr_boxs3 a');
        
        //Extract links and generate unique IDs
        const links = linkElements.map((i, elem) => ({
            id: crypto.randomUUID(),
            url: $(elem).attr('href'),
            source: 'inquirer'
        })).get()
        return links;
    } catch(err) {
        console.error(err)
    }
}
async function scrapeInquirerHeadlines() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        var titles = []
        $('div#tr_boxs3 a.optimize-track').each(function(i, elem) {
            titles[i] = $(elem).text();
        })
        return titles;
    } catch(err) {
        console.error(err)
    }
}
async function scrapeInquirerPage(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data)
        const title = $('#landing-headline h1, #art-head-group h1').text();
        const paragraphs = [];
        $('#article-content p').each((i, elem) => {
            paragraphs.push($(elem).text());
        })
        const result = {title, paragraphs}

        return result;
    } catch(err) {
        console.error(err)
    }
}

module.exports = { scrapeInquirerLinks, scrapeInquirerHeadlines, scrapeInquirerPage };