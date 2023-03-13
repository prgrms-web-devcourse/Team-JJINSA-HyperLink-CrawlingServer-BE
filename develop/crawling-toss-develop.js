const utils = require('../utils.js');
const axios = require('axios');
const cheerio = require('cheerio');
const amqp = require('amqplib');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';

async function main() {
    const response = await axios.get(
        'https://toss.tech/tech'
    );

    const $ = cheerio.load(response.data);
    const elements = $('ul.css-onwccc').children("a");

    resultList = []
    elements.each((idx, elem) => {
        if(Date.parse($(elem).find("span.e3wfjt70").text()) < Date.parse("2022-01-01")) return false;
        console.log(new Date(Date.parse($(elem).find("span.e3wfjt70").text())).toDateString());
        resultList.push({
            title: $(elem).find("span.e3wfjt74").text(),
            link: 'https://toss.tech' +  $(elem).attr("href"),
            contentImgLink: 
                $(elem).find("img").attr("srcset") != undefined  ? 
                $(elem).find("img").attr("srcset").split(' ')[0] : 
                "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_toss.png",
            categoryName: "develop",
            creatorName: "토스 기술 블로그"
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
