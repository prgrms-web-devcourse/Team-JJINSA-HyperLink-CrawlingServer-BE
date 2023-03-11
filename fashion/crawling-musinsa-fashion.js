const utils = require('../utils.js');
const axios = require('axios');
const amqp = require('amqplib');
const cheerio = require('cheerio');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';
async function main() {
  resultList = [];

  for (let pageNum = 1; pageNum <= 12; pageNum++) {
    const response = await axios.get(
      'https://www.musinsa.com/mz/news?p=' + pageNum
    );

    const $ = cheerio.load(response.data);
    const elements = $('ul.scmenu-list.news li');

    [...elements].forEach((e) => {
      const elem = $(e);
      if (elem.find('div.info h3.title a.category').text() === '패션') {
        resultList.push({
          title: elem.find('h3').text(),
          link: elem.children('a').attr('href'),
          contentImgLink: elem.find('a span.imgBox img').attr('src'),
          categoryName: 'fashion',
          creatorName: elem.find('div.info div.dateLine span.brand').text(),
        });
      }
    });
  }

  return resultList;
}

main().then(async (responses) => {
  console.log(responses);
  //const connect = await amqp.connect(MQ_URL);

  //await utils.connectToChannelAndPublish(connect, responses);

  //await connect.close();
});
