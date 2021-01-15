const axios = require("axios");
const cheerio = require("cheerio");
const baseURL = require("../constants/constant");
const express = require("express");
const router = express.Router();

// filtering
router.get("/manga/filter/:pageNumber", (req, res) => {
  let genre = req.query.genre == undefined ? "" : req.query.genre;
  let status = req.query.status == undefined ? "" : req.query.status;
  let type = req.query.type == undefined ? "" : req.query.type;
  let order = req.query.order == undefined ? "" : req.query.order;
  let pageNumber = req.params.pageNumber;

  let url =
    pageNumber === 1
      ? `${baseURL}/manga/?genre%5B%5D=${genre}&status=${status}&type=${type}&order=${order}`
      : `${baseURL}/manga/?page=${pageNumber}&genre%5B%5D=${genre}&status=${status}&type=${type}&order=${order}`;

  axios
    .get(url)
    .then((response) => {
      let obj = {};
      let filterResult = scrapeListManga(response);

      obj.filter_result = filterResult;

      res.send(obj.filter_result[0].listManga);
    })
    .catch((err) => console.log(err));
});

// search manga
router.get("/manga/search/:pageNumber", (req, res) => {
  let search = req.query.search;
  let pageNumber = req.params.pageNumber;
  let url =
    pageNumber == 1
      ? `${baseURL}/?s=${search}`
      : `${baseURL}/page/${pageNumber}/?s=${search}`;

  axios
    .get(url)
    .then((response) => {
      let obj = {};

      let searchResult = scrapeListManga(response);
      obj.search_result = searchResult;

      res.send(obj.search_result[0].searchResult);
    })
    .catch((err) => console.log(err));
});

// getting genre, status, type, orders
router.get("/genres", (req, res) => {
  axios
    .get(`${baseURL}/manga/`)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $("#content > div.wrapper > div.postbody > div.bixbox");
      let genres = [];
      let status = [];
      let type = [];
      let orders = [];
      let obj = {};

      function scrapeFilterValue(arr, selector) {
        element.find(selector).each((i, el) => {
          let value, label;
          value = $(el).find("input").attr("value");
          label = $(el).find("label").text();
          arr.push({
            value,
            label,
          });
        });
      }

      scrapeFilterValue(
        genres,
        "div.mrgn > div.advancedsearch > div.quickfilter > form > div.filter.dropdown:first-child > ul > li"
      );

      scrapeFilterValue(
        status,
        "div.mrgn > div.advancedsearch > div.quickfilter > form > div:nth-child(2) > ul > li"
      );

      scrapeFilterValue(
        type,
        "div.mrgn > div.advancedsearch > div.quickfilter > form > div:nth-child(3) > ul > li"
      );

      scrapeFilterValue(
        orders,
        "div.mrgn > div.advancedsearch > div.quickfilter > form > div:nth-child(4) > ul > li"
      );

      obj.status = status;
      obj.type = type;
      obj.order = orders;
      obj.genre = genres;
      // obj.order_by = orders;
      res.send(obj);
    })
    .catch((err) => console.log(err));
});

// getting the detail manga
router.get("/manga/detail/:endpoint", (req, res) => {
  let endpoint = req.params.endpoint;
  axios
    .get(`${baseURL}/manga/${endpoint}`)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $("div.main-info");
      const tableElement = $("div.info-left > div > div.tsinfo > div.imptdt");
      let obj = {};
      let genres = [];
      let chapter_list = [];

      // Getting the title of the manga
      obj.title = $("#titlemove > h1").text();

      // getting rating value
      obj.rating = element
        .find("div.info-left > div > div.rating.bixbox > div > div.num")
        .text();

      // getting a big background
      obj.background = $("#content > div > div.bigcover > div")
        .css("background-image")
        .replace(/[()\']/g, "")
        .replace(/(url)/g, "");

      // Getting the thumbnail
      obj.thumb = element
        .find("div.info-left > div > div.thumb > img")
        .attr("src");

      // getting synopsis of the manga
      obj.synopsis = element
        .find(
          "div.info-right > div.info-desc.bixbox > div:nth-child(3) > div > p"
        )
        .text();

      const scrapeTable = (contains) => {
        return $(`div.imptdt:contains("${contains}")`).find("i, a").text();
      };

      let status = scrapeTable("Status");
      let type = scrapeTable("Type");
      let released = scrapeTable("Released");
      let author = scrapeTable("Author");
      let artist = scrapeTable("Artist");
      let serialization = scrapeTable("Serialization");
      let posted_by = scrapeTable("Posted By");
      let posted_on = scrapeTable("Posted On");
      let updated_on = scrapeTable("Updated On");
      // console.log(status);

      obj.table_info = {
        status,
        type,
        released,
        author,
        artist,
        serialization,
        posted_by,
        posted_on,
        updated_on,
      };

      // getting genres of the manga
      element
        .find("div.info-right > div.info-desc > div:nth-child(2) > span > a")
        .each((i, el) => {
          let genre = $(el).text();
          genres.push(genre);
        });
      obj.genres = genres;

      // getting lsit of the chapter
      $("#chapterlist > ul > li").each((i, el) => {
        let chapter, date, endpoint;
        chapter = $(el)
          .find("div.chbox > div.eph-num > a > span:nth-child(1)")
          .text();
        date = $(el)
          .find("div.chbox > div.eph-num > a > span:nth-child(2)")
          .text();
        endpoint = $(el)
          .find("div.chbox > div.eph-num > a")
          .attr("href")
          .replace(/https:\/\/kiryuu.co\//, "");
        chapter_list.push({
          chapter,
          date,
          endpoint,
        });
      });
      obj.chapter_list = chapter_list;

      res.send(obj);
    })
    .catch((err) => console.log(err));
});

// getting the chapter
router.get("/ch/:endpoint", async (req, res) => {
  let endpoint = req.params.endpoint;

  axios
    .get(`${baseURL}/${endpoint}`)
    .then((response) => {
      const $ = cheerio.load(response.data, { xmlMode: true });
      const a = cheerio.load(response.data);
      const chapterElement = $("#readerarea > noscript").html();
      const element = $("div.entry-content");
      let chapter = [];
      let obj = {};

      $("p img")
        .html(chapterElement)
        .each((i, el) => {
          let chapter_link, index;
          chapter_link = $(el).attr("src");
          index = i;
          chapter.push({
            chapter_link,
            index,
          });
        });
      obj.endpoint = endpoint;
      obj.current_chapter = endpoint.replace(/[^0-9]/g, "");
      obj.chapter_pages = chapter.length;
      obj.chapter = chapter;

      res.send(obj);
    })
    .catch((err) => console.log(err));
});

function scrapeListManga(response) {
  const $ = cheerio.load(response.data);
  const element = $("#content > div.wrapper > div.postbody > div.bixbox");
  const searchElement = $("#content > div.wrapper > div.postbody > div.bixbox");
  let listManga = [];
  let searchResult = [];

  // Getting for search page / search result
  element.find("div.listupd > div.bs").each((i, el) => {
    let title, thumb, last_chapter, rating_score, endpoint;
    title = $(el).find("div.bsx > a > div.bigor > div.tt").text().trim();
    thumb = $(el).find("div.bsx > a > div.limit > img").attr("src");
    last_chapter = $(el)
      .find("div.bsx > a > div.bigor > div.adds > div.epxs")
      .text();
    rating_score = $(el)
      .find("div.bsx > a > div.bigor > div.adds div.numscore")
      .text();
    endpoint = title
      .replace(/[^\w\s-]|(.)(?=\1)/g, "")
      .replace(/\s/g, "-")
      .replace(/[^\w\s-]|(.)(?=\1)/g, "")
      .toLowerCase();

    searchResult.push({
      title,
      thumb,
      last_chapter,
      rating_score,
      endpoint,
    });
  });

  // Getting for mangaList
  element.find("div.mrgn > div.listupd > div.bs").each((i, el) => {
    let title, thumb, last_chapter, rating_score, endpoint;
    title = $(el).find("div.bsx > a > div.bigor > div.tt").text().trim();
    thumb = $(el).find("div.bsx > a > div.limit > img").attr("src");
    last_chapter = $(el)
      .find("div.bsx > a > div.bigor > div.adds > div.epxs")
      .text();
    rating_score = $(el)
      .find("div.bsx > a > div.bigor > div.adds div.numscore")
      .text();
    endpoint = title
      .replace(/[^\w\s-]|(.)(?=\1)/g, "")
      .replace(/\s/g, "-")
      .replace(/[^\w\s-]|(.)(?=\1)/g, "")
      .toLowerCase();

    listManga.push({
      title,
      thumb,
      last_chapter,
      rating_score,
      endpoint,
    });
  });

  return [{ searchResult, listManga }];
}

module.exports = router;
