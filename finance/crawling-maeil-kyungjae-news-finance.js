const utils = require('../utils.js');
const axios = require('axios');
const cheerio = require('cheerio');
const amqp = require('amqplib');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';

async function main() {
  const response = await axios.get(
    'https://www.mk.co.kr/news/economy/'
  );

  const $ = cheerio.load(response.data);
  const elements = $('ul.latest_news_list')
    .children('li.news_node')
    .not('li.ad_wrap');
  resultList = [];
  elements.each((idx, elem) => {
    if (
      Date.parse(
        $(elem)
          .children('a.news_item')
          .find('div.time_area')
          .find('span')
          .text()
      ) < Date.parse('2022-01-01')
    )
      return false;
    
    resultList.push({
      title: $(elem)
        .children('a.news_item')
        .find('div.txt_area')
        .find('h3.news_ttl')
        .text(),
      link: $(elem).find('a.news_item').attr('href'),
      contentImgLink:
        $(elem)
          .children('a.news_item')
          .find('div.thumb_area')
          .find('img')
          .attr('data-src') != undefined
          ? $(elem)
              .children('a.news_item')
              .find('div.thumb_area')
              .find('img')
              .attr('data-src')
          : 'https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/creator-logo-image/logo_maeil_kyungjae_creator.png',
      categoryName: 'finance',
      creatorName: '매일 경제 뉴스',
    });
  });
  return resultList;
}
main().then(async (responses) => {
  const connect = await amqp.connect(MQ_URL);
  await utils.connectToChannelAndPublish(connect, responses);
  await connect.close();
});
