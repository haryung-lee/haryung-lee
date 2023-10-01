const cheerio = require('cheerio');
const axios = require('axios');
const fs = require("fs");
const path = require("path");

const URL = "https://halang.tech";
const MAX_POSTS = 5;

const readFile = async (dirPath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(dirPath, (err, file) => {
            if (err) reject(err);
            resolve(file);
        });
    });
};

const writeFile = async (dirPath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(dirPath, data, (err, file) => {
            if (err) reject(err);
            resolve(file);
        });
    });
};


const getHtml = async () => {
  try {
    return await axios.get(URL);
  } catch (error) {
    console.error(error);
  }
}

getHtml()
  .then(html => {
    let posts = [];
    const $ = cheerio.load(html.data);
    const $postList = $('body main div div.mid div.my-2').children('a');

    $postList.each(function (i, _) {
      posts[i] = {
        title: $(this).find('h2').text(),
        link: $(this).attr('href'),
        data: $(this).find('div.date').children('div.content').text(),
      };
    });

    const data = posts.filter(n => n.title).slice(0, MAX_POSTS);
    return data;
  })
  .then ( async (res) => {
    const readme = (await readFile(path.join(process.cwd(), 'TEMPLATE.md'))).toString()
    const replaced = res.map((post) => `- [${post.title}](${URL}${post.link}) - ${post.data}`).join('\n');
    const newReadme = readme.replace(/(<!-- New Posts -->)/, replaced);
    await writeFile(path.join(process.cwd(), 'README.md'), newReadme);
  });