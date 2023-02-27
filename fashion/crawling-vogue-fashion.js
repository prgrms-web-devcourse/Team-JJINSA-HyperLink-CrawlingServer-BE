const utils = require('../utils.js');
const amqp = require('amqplib');

const MQ_URL = 'amqp://guest:guest@127.0.0.1';

async function main() {
    resultList = []
    for(let pageNum = 1; pageNum <= 10; pageNum++) {
        const response = await fetch("https://www.vogue.co.kr/wp-admin/admin-ajax.php", {
            "headers": {
              "accept": "application/json, text/javascript, */*; q=0.01",
              "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
              "Referer": "https://www.vogue.co.kr/fashion/fashion-trend/",
              "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": "action=get_posts_custom_v2&posts_per_page=12&post_type=post&paged=" + pageNum + "&tax1_slug=fashion&tax2_slug=fashion-trend&term2_id=42",
            "method": "POST"
          });
        
        elements = await response.json();
        elements = elements.current_posts;
        console.log(elements.length);
    
        elements.forEach((elem) => {
            // if(Date.parse($(elem).find("span.post-meta").find("span.post-date").text()) < Date.parse("2022-01-01")) return false;
            // console.log($(elem).find("span.post-thumb").attr("style")== undefined);
            // console.log(new Date(Date.parse($(elem).find("span.post-meta").find("span.post-date").text())).toDateString());
            resultList.push({
                title: elem.post_title,
                link: elem.permalink,
                contentImgLink: 
                    elem.post_thumbnail_url != undefined  ? 
                    elem.post_thumbnail_url : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_vogue.png",
                category: "fashion",
                creator: "VOGUE 패션 매거진"
            })
        });
    }
    
    return resultList;
}
main()
.then(async responses => {
    console.log(responses.length);
    const connect = await amqp.connect(MQ_URL);

    await utils.connectToChannelAndPublish(connect, responses);

    await connect.close();
});
