const request = require('request-promise');
const utils = require('../utils.js');
const amqp = require('amqplib');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';

async function main() {
    resultList = []
    for(let pageNum = 1; pageNum <= 1; pageNum++) {
        await request({
            uri:"https://www.vogue.co.kr/wp-admin/admin-ajax.php",
            method: 'POST',
            form: {
                action: 'get_posts_custom_v2',
                posts_per_page: '12',
                post_type: 'post',
                paged: pageNum,
                tax1_slug: 'beauty',
                tax2_slug: 'beauty-trend',
                term2_id: '47',
                key:'value',
            },
            headers: {
                accept: 'application/json, text/javascript, */*; q=0.01',
                acceptEncoding: 'gzip, deflate, br',
                acceptLanguage: 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                cacheControl: 'no-cache',
                connection: 'keep-alive',
                contentLength: 121,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                pragma: 'no-cache',
                referer: 'https://www.vogue.co.kr/beauty/beauty-trend/',
                // userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
                xRequestedWith: 'XMLHttpRequest',
            },
            encoding: 'binary'
        }, function (error, response, body) {
            var elements = JSON.parse(body);
            elements = elements.current_posts;
            elements.forEach((elem) => {
                resultList.push({
                    title: decodeURIComponent(escape(elem.post_title)),
                    link: elem.permalink,
                    contentImgLink: 
                        elem.post_thumbnail_url != undefined  ? 
                        elem.post_thumbnail_url : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_vogue.png",
                    categoryName: "beauty",
                    creatorName: "VOGUE 뷰티 매거진"
                })
            });
        });
    }
    return resultList;
}
main()
.then(async responses => {
    const connect = await amqp.connect(MQ_URL);

    await utils.connectToChannelAndPublish(connect, responses);

    await connect.close();
});
