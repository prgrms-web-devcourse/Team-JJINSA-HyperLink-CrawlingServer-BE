const utils = require('../utils.js');
const axios = require('axios');
const cheerio = require('cheerio');
const amqp = require('amqplib');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';

async function main() {
    resultList = []
    pageNum = 1;
    const response = await axios.get(
        'https://tech.kakao.com/blog/page/'+ pageNum + '/#posts'
    );

    const $ = cheerio.load(response.data);
    const elements = $('.elementor-posts-container.elementor-posts.elementor-posts--skin-classic.elementor-grid').children(".elementor-post");

    
    elements.each((idx, elem) => {
        if(Date.parse($(elem).find(".elementor-post__text .elementor-post-date").text()) < Date.parse("2022-01-01")) return false;

        resultList.push({
            title:$(elem).find(".elementor-post__text .elementor-post__title a").text().trim(),
            link: $(elem).find(".elementor-post__text .elementor-post__title a").attr("href"),
            contentImgLink: "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo-kakao-tech.png",
            categoryName: "develop",
            creatorName: "카카오 기술 블로그"
        })
        console.log("date : " + $(elem).find(".elementor-post__text .elementor-post-date").text());
    });
    
    return resultList;
}
main()
.then(async responses => {
    const connect = await amqp.connect(MQ_URL);

    await utils.connectToChannelAndPublish(connect, responses);

    await connect.close();
});
