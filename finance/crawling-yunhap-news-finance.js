const utils = require("../utils.js");
const axios = require("axios");
const amqp = require("amqplib");
const cheerio = require("cheerio");

const MQ_URL = "amqp://guest:guest@127.0.0.1";

const getHTML = async (page) => {
  //2 ~ 17까지 존재. 첫페이지는 pathVariable 존재하지않음.
  const response = await axios.get("https://www.yna.co.kr/economy/all/" + page);
  return response.data;
};

async function main() {
  resultList = [];
  var page;
  for (page = 17; page > 0; page--) {
    // console.log("@@@@@@ page: " + page);
    const html = await getHTML(page);
    const $ = cheerio.load(html);
    const $imgCon = $(".img-con");

    $imgCon.each((index, elem) => {
      const $a = $(elem).find("a");
      const $img = $(elem).find("a img");

      resultList.push({
        title: $img.attr("alt"),
        link: "https:" + $a.attr("href"),
        contentImgLink:
          $img.attr("src") != undefined
            ? "https:" + $img.attr("src")
            : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_yunhap_finance.png",
        categoryName: "finance",
        creatorName: "연합 뉴스",
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

// async function recentMain() {
//   const response = await axios.get("https://www.yna.co.kr/economy/all/1");
//   const $ = cheerio.load(response.data);
//   const $imgCon = $(".img-con");
//   resultList = [];

//   $imgCon.each((index, elem) => {
//     const $a = $(elem).find("a");
//     const $img = $(elem).find("a img");

//     resultList.push({
//       title: $img.attr("alt"),
//       link: "https:" + $a.attr("href"),
//       contentImgLink:
//         $img.attr("src") != undefined
//           ? "https:" + $img.attr("src")
//           : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_yunhap_finance.png",
//       categoryName: "finance",
//       creatorName: "연합 뉴스",
//     });
//   });

//   console.log(resultList);
//   return resultList;
// }
