/**
 * @description : 내부 요청 API 호출 방법 몰라서 진행 안함. 후에 퍼페티어로 하던지 시간 없으면 안할듯.
 */

const axios = require('axios');
const cheerio = require('cheerio');
// const puppeteer = require('puppeteer');

async function main() {
    resultList = []
    for(let pageNum = 1; pageNum <= 11; pageNum++) {
        const response = await axios.post(
            'https://techblog.woowahan.com/wp-admin/admin-ajax.php?paged=2', {
                action: "get_posts_data",
                data : {
                    post: {
                        post_type: "post"
                    }
                },
                meta: "main"
            }
        );
    
        console.log(response);
        // const elements = $('.elementor-posts-container.elementor-posts.elementor-posts--skin-classic.elementor-grid').children(".elementor-post");
    
        
        // elements.each((idx, elem) => {
        //     if(Date.parse($(elem).find(".elementor-post__text .elementor-post-date").text()) < Date.parse("2022-01-01")) return false;
    
        //     resultList.push({
        //         title:$(elem).find(".elementor-post__text .elementor-post__title a").text().trim(),
        //         link: $(elem).find(".elementor-post__text .elementor-post__title a").attr("href"),
        //         contentImgLink: "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo-kakao-tech.png",
        //         category: "develop",
        //         creator: "카카오 기술 블로그"
        //     })
        //     console.log("date : " + $(elem).find(".elementor-post__text .elementor-post-date").text());
        // });
    }
    
    return resultList;
}
main()
.then(response => console.log(response));
