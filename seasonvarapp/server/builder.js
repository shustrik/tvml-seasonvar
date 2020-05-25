function buildSerialsList(serials, serialHandler) {
    const document = new DOMParser().parseFromString(serialsTemplate, "application/xml");
    const list = document.getElementById("list")
    const grid = buildGrid(document);
    serials.forEach(function (item, index) {
        const lockup = buildLockupItem(document, item, index, serialHandler)
        const section = grid.getElementsByTagName("section").item(0)
        section.appendChild(lockup)
    });
    list.appendChild(grid);
    return document
}

function buildGrid(document) {
    let grid = document.createElement('grid')
    grid.setAttribute('class', '5ColumnGrid')
    let section = document.createElement("section")
    grid.appendChild(section)
    return grid
}

function buildLockupItem(document, item, index, handler) {
    let lockup = document.createElement("lockup");
    lockup.setAttribute("resultIndex", index);
    lockup.setAttribute("itemID", item.id);
    let img = document.createElement('img');
    let overlay = document.createElement("overlay")
    overlay.setAttribute("style", "tv-position: top; tv-align:center;  padding: 0 0 0 0")// padding: 0 0 330 208;
    if (item.isWatching == true) {
        let countTextBadge = document.createElement("title")
        countTextBadge.setAttribute("style", "background-color: red")
        countTextBadge.textContent = item.new.length
        let favoriteTextBadge = document.createElement("badge")
        favoriteTextBadge.setAttribute("style", "tv-tint-color: red;")
        favoriteTextBadge.setAttribute("src", "resource://button-rated")
        overlay.appendChild(favoriteTextBadge)
        overlay.appendChild(countTextBadge)
    }
    img.setAttribute('src', item.poster)
    img.setAttribute('width', '250');
    img.setAttribute('height', '375');
    let title = document.createElement('title');
    title.textContent = item.name
    lockup.appendChild(img)
    lockup.appendChild(overlay)
    lockup.appendChild(title)
    lockup.addEventListener("play", handler)
    lockup.addEventListener("select", handler)
    return lockup
}

function buildSerial(serialData, playHandler, addToWatch, addToFavorite) {
    let document = new DOMParser().parseFromString(serial, "application/xml");
    let banner = document.getElementsByTagName("banner").item(0)
    banner.appendChild(buildHeroImg(document, serialData.poster, 665, 665))
    banner.appendChild(createSerialInfo(document, serialData))
    banner.appendChild(createSerialStack(document, serialData, playHandler, addToWatch, addToFavorite))
    let rating = document.getElementById("rating")
    if (Object.keys(serialData.rating).length == 0) {
        const removeElem = rating.parentNode
        rating.parentNode.parentNode.removeChild(removeElem)
    } else {
        rating.appendChild(buildRating(document, serialData))
    }
    return document
}

function buildHeroImg(document, poster, width, height) {
    let img = document.createElement("heroImg")
    img.setAttribute('src', poster)
    img.setAttribute('width', width)
    img.setAttribute('height', height)
    return img
}

function createSerialInfo(document, season) {
    let infoList = document.createElement('infoList')
    let info = document.createElement('info')
    let header = document.createElement('header')
    let title = document.createElement('title')
    title.textContent = "Жанры"
    header.appendChild(title)
    info.appendChild(header)
    season.genre.forEach(function (value) {
        let text = document.createElement('text')
        text.textContent = value
        info.appendChild(text)
    })
    infoList.appendChild(info)

    info = document.createElement('info')
    header = document.createElement('header')
    title = document.createElement('title')
    title.textContent = "Актеры"
    header.appendChild(title)
    info.appendChild(header)
    let text = document.createElement('text')
    text.textContent = "Актер 1"
    info.appendChild(text)
    text = document.createElement('text')
    text.textContent = "Актер 2"
    info.appendChild(text)


    info = document.createElement('info')
    header = document.createElement('header')
    title = document.createElement('title')
    title.textContent = "Страна"
    header.appendChild(title)
    info.appendChild(header)
    season.countries.forEach(function (value) {
        let text = document.createElement('text')
        text.textContent = value
        info.appendChild(text)
    })

    infoList.appendChild(info)
    return infoList
}

function createSerialStack(document, season, playHandler, addToWatchHandler, addToFavoriteHandler) {
    let stack = document.createElement("stack")
    let title = document.createElement("title")
    title.textContent = season.name
    stack.appendChild(title)
    let row = document.createElement('row')
    if (season.originalName !== null) {
        let text = document.createElement('text')
        text.textContent = season.originalName
        row.appendChild(text)
    }
    let badge = document.createElement('badge')
    badge.setAttribute('src', 'resource://hd')
    badge.setAttribute('class', 'badge')
    row.appendChild(badge)
    stack.appendChild(row)
    let description = document.createElement('description')
    description.setAttribute('handlesOverflow', true)
    description.textContent = season.description
    stack.appendChild(description)
    let buttonRow = document.createElement('row')
    let buttonLockupPlay = document.createElement('buttonLockup')
    let badgePlay = document.createElement('badge')
    badgePlay.setAttribute('src', 'resource://button-play')
    let buttonTitlePlay = document.createElement('title')
    buttonTitlePlay.textContent = 'Смотреть'
    buttonLockupPlay.appendChild(badgePlay)
    buttonLockupPlay.appendChild(buttonTitlePlay)
    buttonLockupPlay.addEventListener("play", playHandler)
    buttonLockupPlay.addEventListener("select", playHandler)

    let buttonLockupAddToWatch = document.createElement('buttonLockup')
    let buttonLockupAddToWatchBadge = document.createElement('badge')
    buttonLockupAddToWatchBadge.setAttribute("src", "resource://button-add")
    let titleAddToWatchText = 'Я смотрю'
    if (season.isWatching == true) {
        buttonLockupAddToWatchBadge.setAttribute("src", "resource://button-remove")
        titleAddToWatchText = "Не смотрю"
    }
    let buttonLockupAddToWatchTile = document.createElement('title')
    buttonLockupAddToWatchTile.textContent = titleAddToWatchText
    buttonLockupAddToWatch.appendChild(buttonLockupAddToWatchBadge)
    buttonLockupAddToWatch.appendChild(buttonLockupAddToWatchTile)
    buttonLockupAddToWatch.addEventListener("play", addToWatchHandler)
    buttonLockupAddToWatch.addEventListener("select", addToWatchHandler)

    let buttonLockupFavorite = document.createElement('buttonLockup')
    let badgeFavorite = document.createElement('badge')
    let src = 'resource://button-rate'
    let titleText = 'В избранное'
    if (season.isFavorite) {
        src = 'resource://button-rated'
        titleText = "Удалить"
    }
    badgeFavorite.setAttribute('src', src)
    let buttonTitleFavorite = document.createElement('title')
    buttonTitleFavorite.textContent = titleText
    buttonLockupFavorite.appendChild(badgeFavorite)
    buttonLockupFavorite.appendChild(buttonTitleFavorite)
    buttonLockupFavorite.addEventListener("play", addToFavoriteHandler)
    buttonLockupFavorite.addEventListener("select", addToFavoriteHandler)
    buttonRow.appendChild(buttonLockupPlay)
    buttonRow.appendChild(buttonLockupAddToWatch)
    buttonRow.appendChild(buttonLockupFavorite)
    stack.appendChild(buttonRow)
    return stack
}

function buildSeasons(document, seasons, episodesHandler, markSeasonAsWatchedHandler) {
    let section = document.createElement('section')
    seasons.forEach(function (item, key) {
        section.appendChild(buildSerialSeason(document, item, episodesHandler, markSeasonAsWatchedHandler))
    })
    return section
}

function buildSerialSeason(document, season, episodesHandler, markSeasonAsWatchedHandler) {
    let lockup = document.createElement('lockup')
    lockup.setAttribute('itemId', season.id)
    lockup.addEventListener('play', episodesHandler)
    lockup.addEventListener('select', episodesHandler)
    lockup.addEventListener('holdselect', function (event) {
        markSeasonAsWatchedHandler(season.id)
    })

    let img = document.createElement('img')
    img.setAttribute('src', season.poster)
    img.setAttribute('width', 172)
    img.setAttribute('height', 300)
    lockup.appendChild(img)
    let title = document.createElement('title')
    title.textContent = season.name
    lockup.appendChild(title)
    return lockup
}

function buildEpisodesList(serial, episodes, play, markWatched) {
    let document = new DOMParser().parseFromString(episodesTemplate, "application/xml");
    document.getElementById("banner").appendChild(buildHeroImg(document, serial.poster, 556, 556))
    let title = document.createElement("title")
    title.textContent = serial.name
    document.getElementById("header").appendChild(title)
    document.getElementById("description").textContent = serial.description
    let list = document.getElementById("list")
    episodes.forEach(function (item, key) {
        let listItemLockup = document.createElement('listItemLockup')
        listItemLockup.setAttribute('name', item.name)
        listItemLockup.addEventListener("select", function (event) {
            play(item)
        })
        listItemLockup.addEventListener("holdselect", function (event) {
            markWatched(item.id)
            let textBadge = document.createElement('img')
            textBadge.setAttribute('src', "resource://button-checkmark")
            textBadge.setAttribute('contentsMode', "aspectFill")
            textBadge.setAttribute('theme', "light")
            this.appendChild(textBadge)
        })
        let title = document.createElement('title')
        title.textContent = item.name
        if (item.isWatched) {
            let textBadge = document.createElement('img')
            textBadge.setAttribute('src', "resource://button-checkmark")
            textBadge.setAttribute('contentsMode', "aspectFill")
            textBadge.setAttribute('theme', "light")
            listItemLockup.appendChild(textBadge)
        }
        listItemLockup.appendChild(title)
        list.appendChild(listItemLockup)
    })
    return document
}

function buildRating(document, season) {
    for (let type in season.rating) {
        let card = document.createElement('ratingCard')
        let title = document.createElement('title')
        title.textContent = season.rating[type].ratio + '/ 10'
        let titleType = document.createElement('title')
        titleType.textContent = type
        let ratingBadge = document.createElement('ratingBadge')
        ratingBadge.setAttribute('value', season.rating[type].ratio / 10)
        let description = document.createElement('description')
        description.textContent = " Среди " + season.rating[type].votes_count + " голосов"
        card.appendChild(description)
        card.appendChild(titleType)
        card.appendChild(title)
        card.appendChild(ratingBadge)
        return card
    }
}
