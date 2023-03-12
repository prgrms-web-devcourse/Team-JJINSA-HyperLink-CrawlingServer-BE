const utils = require('../utils.js');
const axios = require('axios');
const amqp = require('amqplib');
const cheerio = require('cheerio');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';
async function main() {
  resultList = [];

  for (let pageNum = 1; pageNum <= 12; pageNum++) {
    const response = await axios.get(
      `https://www.hani.co.kr/arti/economy/economy_general/list${pageNum}.html`
    );

    const $ = cheerio.load(response.data);
    const elements = $('div.section-list-area').children('div.list');

    elements.each((idx, elem) => {
      resultList.push({
        title: $(elem).find('div.article-area h4 a').text(),
        link: 'https://www.hani.co.kr' + $(elem).find('a').attr('href'),
        contentImgLink: $(elem).find('img').attr('src') != undefined ? $(elem).find('img').attr('src') : 'https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/creator-logo-image/logo_hankyoreh_creator.jpg',
        categoryName: 'finance',
        creatorName: '한겨레 경제',
      });
    });
  }

  return resultList;
}

main().then(async (responses) => {
  const connect = await amqp.connect(MQ_URL);
  await utils.connectToChannelAndPublish(connect, responses);
  await connect.close();
});
