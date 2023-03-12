const utils = require("../utils.js");
const axios = require("axios");
const amqp = require("amqplib");
const cheerio = require("cheerio");

const MQ_URL = "amqp://guest:guest@127.0.0.1";

const getHTML = async () => {
  const response = await axios.get(
    "https://news.sbs.co.kr/news/newsSection.do?sectionType=02&plink=SNB&cooper=SBSNEWS"
  );
  return response.data;
};

async function main() {
  const html = await getHTML();
  const $ = cheerio.load(html);
  const $newsList = $(".w_news_list ul li");

  resultList = [];
  $newsList.each((index, elem) => {
    const $img = $(elem).find(".news span img");
    const $a = $(elem).find(".news");

    resultList.push({
      title: $a.attr("title"),
      link: "https://news.sbs.co.kr/" + $a.attr("href"),
      contentImgLink:
        $img.attr("src") != undefined
          ? $img.attr("src")
          : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_sbs_finance.png",
      categoryName: "finance",
      creatorName: "sbs 경제",
    });
  });

  return resultList;
}

main().then(async (responses) => {
  console.log(responses);
  // const connect = await amqp.connect(MQ_URL);

  // await utils.connectToChannelAndPublish(connect, responses);

  // await connect.close();
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
