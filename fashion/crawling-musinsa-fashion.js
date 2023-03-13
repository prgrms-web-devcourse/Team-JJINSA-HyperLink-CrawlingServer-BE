const utils = require('../utils.js');
const axios = require('axios');
const amqp = require('amqplib');
const cheerio = require('cheerio');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';
async function main() {
  resultList = [];

  for (let pageNum = 1; pageNum <= 12; pageNum++) {
    const response = await axios.get(
      'https://www.musinsa.com/mz/news/fashion?p=' + pageNum
    );

    const $ = cheerio.load(response.data);
    const elements = $('ul.scmenu-list.news li');

    [...elements].forEach((e) => {
      const elem = $(e);

      resultList.push({
        title: elem.find('h3').text(),
        link: elem.children('a').attr('href'),
        contentImgLink: elem.find('a span.imgBox img').attr('src') != undefined ? elem.find('a span.imgBox img').attr('src') : 'https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/creator-logo-image/logo_musinsa_creator.png',
        categoryName: 'beauty',
        creatorName: "무신사"
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
