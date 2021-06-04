const cheerio = require("cheerio");
const baseURL = require("../constants/constant");

class Helper {
  
  scrapeListManga(response) {
    const $ = cheerio.load(response.data);
    const element = $("#content > div.wrapper > div.postbody > div.bixbox");
    // const searchElement = $("#content > div.wrapper > div.postbody > div.bixbox");
    let listManga = [];
    // let searchResult = [];
    // let searchPagination;
    let searchResultObj = {};
    let listMangaObj = {};

    // Getting for search page / search result
    element.find("div.listupd div.bs").each((i, el) => {
      let title, thumb, latest_chapter, rating, endpoint;
      title = $(el).find("div.bsx > a > div.bigor > div.tt").text().trim();
      thumb = $(el).find("div.bsx > a > div.limit > img").attr("src");
      latest_chapter = $(el)
        .find("div.bsx > a > div.bigor > div.adds > div.epxs")
        .text();
      rating = $(el)
        .find("div.bsx > a > div.bigor > div.adds div.numscore")
        .text();
      endpoint = $(el)
        .find("div.bsx > a")
        .attr('href')
        .replace(`${baseURL}/manga/`, '')
        .replace(/\//g, '')

      listManga.push({
        title,
        thumb,
        latest_chapter,
        rating,
        endpoint,
      });
    });
    searchResultObj.manga_list = listManga;

    // Getting for mangaList
    // element.find("div.mrgn > div.listupd > div.bs").each((i, el) => {
    //   let title, thumb, latest_chapter, rating, endpoint;
    //   title = $(el).find("div.bsx > a > div.bigor > div.tt").text().trim();
    //   thumb = $(el).find("div.bsx > a > div.limit > img").attr("src");
    //   latest_chapter = $(el)
    //     .find("div.bsx > a > div.bigor > div.adds > div.epxs")
    //     .text();
    //   rating = $(el)
    //     .find("div.bsx > a > div.bigor > div.adds div.numscore")
    //     .text();
    //   endpoint = title
    //     .replace(/[^\w\s-]|(.)(?=\1)/g, "")
    //     .replace(/\s/g, "-")
    //     .replace(/[^\w\s-]|(.)(?=\1)/g, "")
    //     .toLowerCase();

    //   listManga.push({
    //     title,
    //     thumb,
    //     latest_chapter,
    //     rating,
    //     endpoint,
    //   });
    // });
    listMangaObj.manga_list = listManga;

    return [searchResultObj, listMangaObj];
  }
}

module.exports = new Helper();