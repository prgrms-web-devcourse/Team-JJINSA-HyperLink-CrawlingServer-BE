const utils = require('../utils.js');
const axios = require('axios');
const cheerio = require('cheerio');
const amqp = require('amqplib');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';

async function main() {
    const response = await axios.get(
        'https://helloworld.kurly.com/'
    );

    const $ = cheerio.load(response.data);
    const elements = $('ul.post-list').children("li.post-card");

    resultList = []
    elements.each((idx, elem) => {
        if(Date.parse($(elem).find("span.post-meta").find("span.post-date").text()) < Date.parse("2022-01-01")) return false;
        console.log(new Date(Date.parse($(elem).find("span.post-meta").find("span.post-date").text())).toDateString());
        resultList.push({
            title: $(elem).find("h3.post-title").text(),
            link: "https://helloworld.kurly.com" +  $(elem).find("a.post-link").attr("href"),
            contentImgLink: 
                $(elem).find("span.post-thumb").attr("style") != undefined  ? 
                "https://helloworld.kurly.com" + $(elem).find("span.post-thumb").attr("style").split('\'')[1] : 
                "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_sns_marketkurly.jpg",
            categoryName: "develop",
            creatorName: "마켓컬리 기술 블로그"
        })
    });
    return resultList;
}
main()
.then(async responses => {
    const connect = await amqp.connect(MQ_URL);

    await utils.connectToChannelAndPublish(connect, responses);

    await connect.close();
});
