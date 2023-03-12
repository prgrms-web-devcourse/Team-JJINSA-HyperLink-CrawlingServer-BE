const utils = require("../utils.js");
const axios = require("axios");
const amqp = require("amqplib");
const cheerio = require("cheerio");

const MQ_URL = "amqp://guest:guest@127.0.0.1";

const getHTML = async () => {
  const response = await axios.get("https://www.donga.com/news/Economy");
  return response.data;
};

async function main() {
  const html = await getHTML();
  const $ = cheerio.load(html);
  const $newList = $(".article_list .thumb");

  resultList = [];
  $newList.each((index, elem) => {
    const $img = $(elem).find("a img");
    const $a = $(elem).find("a");

    resultList.push({
      title: $img.attr("alt"),
      link: $a.attr("href"),
      contentImgLink:
        $img.attr("src") != undefined
          ? $img.attr("src")
          : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_donga_finance.png",
      categoryName: "finance",
      creatorName: "동아 일보 경제",
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
