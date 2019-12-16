const loginTemplate = `<?xml version="1.0" encoding="UTF-8" ?>
<document>
<formTemplate  id="login">
<banner>
<title>Авторизация</title>
<description>введите api ключ от seasonvar</description>
</banner>
<textField id="key">api key</textField>
<footer>
<button>
<text>Отправить</text>
</button>
</footer>
</formTemplate>
</document>
`;
const menu = `<?xml version="1.0" encoding="UTF-8" ?>
<document>
<menuBarTemplate>
<menuBar>
<menuItem method="search">
<title>Поиск</title>
</menuItem>
<menuItem method="serials">
<title>Сериалы</title>
</menuItem>
<menuItem method="my-serials">
<title>Я смотрю</title>
</menuItem>
<menuItem method="favorites">
<title>Закладки</title>
</menuItem>
</menuBar>
</menuBarTemplate>
</document>
`;


const serialsTemplate = `<?xml version="1.0" encoding="UTF-8" ?>
<document>
  <head>
    <style>
    .showTextOnHighlight {
      tv-text-highlight-style: show-on-highlight;
    }
    .5ColumnGrid {
      tv-interitem-spacing: 50;
    }
    </style>
  </head>
  <stackTemplate>
    <collectionList id="list">
    </collectionList>
  </stackTemplate>
</document>`;

const serial = `<?xml version="1.0" encoding="UTF-8" ?>
<document>
  <head>
    <style>
    .showTextOnHighlight {
      tv-text-highlight-style: show-on-highlight;
    }
    .badge {
      tv-tint-color: rgb(0, 0, 0);
    }
    .5ColumnGrid {
      tv-interitem-spacing: 50;
      padding: 50 50 50 50;
      height: 300;
    }
    @media tv-template and (tv-theme:dark) {
        .badge {
          tv-tint-color: rgb(255, 255, 255);
        }
    }
    </style>
  </head>
  <productTemplate theme="dark">
      <banner>
    </banner>
    <shelf class="5ColumnGrid" id="seasons">
    <header><title>Сезоны</title></header>
    </shelf>
    <shelf>
      <header>
        <title>Рейтинг</title>
      </header>
      <section id="rating">
      </section>
    </shelf>
  </productTemplate>
</document>`;
const search = `<?xml version="1.0" encoding="UTF-8" ?>
<document>
<head>
<style>
.showTextOnHighlight {
    tv-text-highlight-style: marquee-and-show-on-highlight;
}
</style>
</head>
<searchTemplate>

<searchField>Search</searchField>
<separator>
</separator>

<collectionList id="resultsList">
    <grid id="resultsGridContainer">
    <section>
</section>
    </grid>
    </collectionList>

    </searchTemplate>
    </document>`;

const episodesTemplate = `<?xml version="1.0" encoding="UTF-8" ?>
<document>
<head>
<style>
</style>
</head>
<compilationTemplate theme="dark">
<list>
<relatedContent>
<itemBanner id="banner">
</itemBanner>
</relatedContent>
<header id="header">
</header>
<section>
<description handlesOverflow="true" id="description"></description>
</section>
<section id="list">
</section>
</list>
</compilationTemplate>
</document>`

const translations = `<?xml version="1.0" encoding="UTF-8" ?>
<document>
<alertTemplate>
</alertTemplate>
</document>`

const seekAlert = `<?xml version="1.0" encoding="UTF-8" ?>
<document>
<divTemplate style="tv-position:bottom; tv-align:center">
<row style="color: white; margin: 0 0 20 0">
<text> Продолжить с места отсановки?</text>
</row>
<row>
<button style ="width: 80; margin: 10; padding: 10; height: 20" id="button-no">
<text>Нет</text>
</button>
<button style ="width: 80; margin: 10; height: 20" id="button-yes">
<text>Да</text>
</button>
</row>
</divTemplate>
</document>`
