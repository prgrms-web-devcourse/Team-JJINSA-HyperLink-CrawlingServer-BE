const utils = require('../utils.js');
const axios = require('axios');
const cheerio = require('cheerio');
const amqp = require('amqplib');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';

async function main() {
    resultList = []
    for(let pageNum = 1; pageNum <= 12; pageNum++) {
        console.log(pageNum);
        const response = await axios.get(
            'https://yozm.wishket.com/magazine/list/develop/?page=' + pageNum
        );
    
        const $ = cheerio.load(response.data);
        const elements = $('div.list-cover').children("div.list-item-link");

        elements.each((idx, elem) => {
            resultList.push({
                title: $(elem).find("div.item-main a.item-title").text().trim(),
                link: "https://yozm.wishket.com" +  $(elem).find("div.item-main a.item-title").attr("href"),
                contentImgLink: 
                $(elem).find("div.item-thumbnail-pc a img.thumbnail-image").attr("src") != undefined  ? 
                    "https://yozm.wishket.com" + $(elem).find("div.item-thumbnail-pc a img.thumbnail-image").attr("src") : 
                    "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_sns_marketkurly.jpg",
                categoryName: "develop",
                creatorName: "요즘 IT"
            })
        });
    }

    
    return resultList;
}
main()
.then(async responses => {
    console.log(resultList);
    // const connect = await amqp.connect(MQ_URL);

    // await utils.connectToChannelAndPublish(connect, responses);

    // await connect.close();
});
