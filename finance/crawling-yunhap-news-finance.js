const utils = require("../utils.js");
const axios = require("axios");
const amqp = require("amqplib");
const cheerio = require("cheerio");

const MQ_URL = "amqp://guest:guest@127.0.0.1";

async function main() {
  const response = await axios.get("https://www.yna.co.kr/economy/all/1");
  const $ = cheerio.load(response.data);
  const $imgCon = $(".img-con");
  resultList = [];

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

  return resultList;
}

main().then(async (responses) => {
  const connect = await amqp.connect(MQ_URL);

  await utils.connectToChannelAndPublish(connect, responses);

  await connect.close();
});


