const utils = require("../utils.js");
const axios = require("axios");
const amqp = require("amqplib");
const cheerio = require("cheerio");

const MQ_URL = "amqp://guest:guest@127.0.0.1";

const getHTML = async () => {
  const response = await axios.get(
    "https://www.kbeauty.news/news/articleList.html?sc_section_code=S1N2&view_type=sm"
  );
  return response.data;
};

async function main() {
  const html = await getHTML();
  const $ = cheerio.load(html);
  const $sectionList = $("#section-list ul li");

  resultList = [];
  $sectionList.each((index, elem) => {
    const $img = $(elem).find("a img");
    const $a = $(elem).find("div h4 a");

    resultList.push({
      title: $a.text(),
      link: "https://www.kbeauty.news/" + $a.attr("href"),
      contentImgLink:
        $img.attr("src") != undefined
          ? $img.attr("src")
          : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_kbeauty_fashion.png",
      categoryName: "beauty",
      creatorName: "k-beauty 패션",
    });
  });
  return resultList;
}

main().then(async (responses) => {
  console.log(responses);
  //const connect = await amqp.connect(MQ_URL);

  //await utils.connectToChannelAndPublish(connect, responses);

  //await connect.close();
});
