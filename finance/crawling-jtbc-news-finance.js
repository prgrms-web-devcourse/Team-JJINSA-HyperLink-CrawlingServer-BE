const utils = require("../utils.js");
const axios = require("axios");
const amqp = require("amqplib");
const cheerio = require("cheerio");

const MQ_URL = "amqp://guest:guest@127.0.0.1";

const getHTML = async () => {
  const response = await axios.get(
    "https://news.jtbc.co.kr/section/index.aspx?scode=20"
  );
  return response.data;
};

async function main(page) {
  const html = await getHTML();
  const $ = cheerio.load(html);
  const $newsList = $("#section_list li");

  resultList = [];
  $newsList.each((index, elem) => {
    const $img = $(elem).find("dl dd a img");
    const $a = $(elem).find("dl dd a");

    resultList.push({
      title: $img.attr("alt"),
      link: "https://news.jtbc.co.kr/" + $a.attr("href"),
      contentImgLink:
        $img.attr("src") != undefined
          ? $img.attr("src")
          : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_jtbc_finance.png",
      categoryName: "finance",
      creatorName: "jtbc 경제",
    });
  });

  return resultList;
}

main(17).then(async (responses) => {
  console.log(responses);
  // const connect = await amqp.connect(MQ_URL);

  // await utils.connectToChannelAndPublish(connect, responses);

  // await connect.close();
});
