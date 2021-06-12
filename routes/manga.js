const axios = require("axios");
const cheerio = require("cheerio");
const baseURL = require("../constants/constant");
const express = require("express");
const router = express.Router();
const helper = require('../helper/helper');

axios.defaults.baseURL = baseURL;

// filtering
router.get("/manga/:pageNumber", (req, res) => {
  let genre = req.query.genre == undefined ? "" : req.query.genre;
  let status = req.query.status == undefined ? "" : req.query.status;
  let type = req.query.type == undefined ? "" : req.query.type;
  let order = req.query.order == undefined ? "" : req.query.order;
  let pageNumber = req.params.pageNumber;

  let url =
    pageNumber === 1
      ? `/manga/?genre%5B%5D=${genre}&status=${status}&type=${type}&order=${order}`
      : `/manga/?page=${pageNumber}&genre%5B%5D=${genre}&status=${status}&type=${type}&order=${order}`;

  axios
    .get(encodeURI(url))
    .then((response) => {
      let obj = {};
      let filterResult = helper.scrapeListManga(response);

      obj = filterResult[1];

      res.send(obj);
    })
    .catch((err) => console.log(err));
});

// search manga
router.get("/manga/s/:pageNumber", (req, res) => {
  let search = req.query.search;
  let pageNumber = req.params.pageNumber;
  let url =
    pageNumber == 1
      ? `/?s=${search}`
      : `/page/${pageNumber}/?s=${search}`;

  axios
    .get(encodeURI(url))
    .then((response) => {
      let obj = {};

      let searchResult = helper.scrapeListManga(response);
      obj = searchResult[0];

      res.send(obj);
    })
    .catch((err) => console.log(err));
});

// getting genre, status, type, orders
router.get("/genres", (req, res) => {
  axios
    .get(encodeURI(`/manga/`))
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
          let value, title;
          value = $(el).find("input").attr("value");
          title = $(el).find("label").text();
          arr.push({
            title,
            value,
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
      res.send(obj);
    })
    .catch((err) => console.log(err));
});

// getting the detail manga
router.get("/manga/detail/:endpoint", (req, res) => {
  let endpoint = req.params.endpoint;
  axios
    .get(encodeURI(`/manga/${endpoint}`))
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $("#content");
      let obj = {};
      let genres = [];
      let chapter_list = [];

      // Getting the title of the manga
      obj.title = $("div.seriestuheader > h1").text();

      // getting rating value
      obj.rating = element
        .find("div.rating.bixbox > div > div.num")
        .text();

      // getting a big background
      obj.background = $("#content > div > div.bigcover > div")
        .css("background-image")
        .replace(/[()\']/g, "")
        .replace(/(url)/g, "");

      // Getting the thumbnail
      obj.thumb = element
        .find("div.seriestucontl > div.thumb > img")
        .attr("src");

      // getting synopsis of the manga
      obj.synopsis = element
        .find(
          // "div.info-right > div.info-desc.bixbox > div:nth-child(3) > div > p"
          "div.seriestuhead > div.entry-content.entry-content-single > p"
        )
        .text();

      const scrapeTable = (contains) => {
        return $(`table.infotable tr > td:contains("${contains}")`).parent().find('td').last().text();
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
        .find("div.seriestugenre > a")
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
          .replace(/https:\/\/kiryuu.id\//, "");
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
    .get(encodeURI(`/${endpoint}`))
    .then((response) => {
      const $ = cheerio.load(response.data);
      const chapterElement = $("#readerarea > noscript").html();
      const element = $(".postarea");
      let chapter = [];
      let obj = {};

      $("p img")
        .each((i, el) => {
          let image, index;
          image = $(el).attr("src").replace(/ /g, "%20");
          index = i;
          chapter.push({
            image,
            index,
          });
        });
      obj.endpoint = endpoint;
      obj.current_chapter = element.find('.headpost > h1.entry-title').text().replace(/[^0-9\.]/g, "")
      obj.total_pages = chapter.length;
      obj.chapter_list = chapter;

      res.send(obj);
    })
    .catch((err) => console.log(err));
});



module.exports = router;
