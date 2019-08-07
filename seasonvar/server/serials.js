class SerialsDocument {
    constructor(api, menuBarFeature) {
        this.api = api;
        this.menuBarFeature = menuBarFeature
    }

    search(menuItem) {
        const doc = new DOMParser().parseFromString(search, "application/xml");
        const that = this
        const searchKeyboard = doc.getElementsByTagName('searchField').item(0).getFeature("Keyboard");
        searchKeyboard.onTextChange = function () {
            that.api.search(function (data) {
                let grid = doc.getElementById("resultsGridContainer")
                let section = doc.getElementsByTagName("section").item(0)
                if (section !== undefined) {
                    grid.removeChild(section)
                }
                section = doc.createElement("section")
                grid.appendChild(section)
                data.forEach(function (item, index) {
                    that.createLockupItem(doc, section, item, index)
                });
            }, function (error) {
                replaceDocument(createAlert("Ошибка", error))
            }, this.text.trim().replace(/\s+/g, " "))
        };
        this.menuBarFeature.setDocument(doc, menuItem)
    }

    serials(menuItem) {
        this.menuBarFeature.setDocument(createLoadingDocument("Загрузка"), menuItem);
        const that = this
        this.api.updateList(function (data) {
                that.buildList(data, menuItem)
            },
            function (error) {
                replaceDocument(createAlert("Ошибка", error))
            });
    }

    mySerials(menuItem) {
        this.menuBarFeature.setDocument(createLoadingDocument("Загрузка"), menuItem);
        const that = this
        let watchingSerials = getWathingSerials()
        let lastSerial = watchingSerials[0]
        this.api.seasonInfo(function (season) {
            let document = new DOMParser().parseFromString(serials, "application/xml");
            let list = document.getElementById("list")
            let group = that.createGrid(document);
            let section = group.getElementsByTagName("section").item(0)
            that.createLockupItem(document, section, season, 0)
            list.appendChild(group);
            that.menuBarFeature.setDocument(document, menuItem);
        }, function (error) {
            replaceDocument(createAlert("Ошибка", error))
        }, lastSerial["watching_season"])
    }

    buildList(data, menuItem) {
        let document = new DOMParser().parseFromString(serials, "application/xml");
        let list = document.getElementById("list")
        let groups = []
        let loadedSerials = new Array()
        const that = this
        data.forEach(function (item, index) {
            if (loadedSerials.includes(item.id)) {
                return;
            }
            loadedSerials.push(item.id)
            let date = new Date(item.create_time * 1000);
            let itemDate = date.getDate()
            if (groups[itemDate] == undefined) {
                groups[itemDate] = that.createGrid(document, date);
            }
            let section = groups[itemDate].getElementsByTagName("section").item(0)
            that.createLockupItem(document, section, item, index)
        });
        for (let date in groups.reverse()) {
            list.appendChild(groups[date]);
        }
        this.menuBarFeature.setDocument(document, menuItem);
    }

    createGrid(document, date = null) {
        let grid = document.createElement('grid')
        grid.setAttribute('class', '5ColumnGrid')
        let header = document.createElement('header')
        header.setAttribute('class', 'grid-header')
        if (date !== null) {
            let title = document.createElement('title')
            title.textContent = date.getUTCDate() + "." + date.getUTCMonth() + "." + date.getFullYear()
            header.appendChild(title)
        }
        grid.appendChild(header)
        let section = document.createElement("section")
        grid.appendChild(section)
        return grid
    }

    createLockupItem(document, section, item, index) {
        let lockup = document.createElement("lockup");
        lockup.setAttribute("resultIndex", index);
        lockup.setAttribute("itemID", item.id);
        let img = document.createElement('img');
        let overlay = document.createElement("overlay")
        overlay.setAttribute("style", "tv-position: bottom-trailing; tv-align:center; padding: 300 0 0 0")
        let textBadge = document.createElement("textBadge")
        if(item.message !== undefined){
            textBadge.textContent = item.message
        }else{
            if(item.season !== undefined){
                textBadge.textContent = item.season[0] + " сезон"
            }
        }
        overlay.appendChild(textBadge)
        img.setAttribute('src', item.poster)
        img.setAttribute('width', '250');
        img.setAttribute('height', '375');
        let title = document.createElement('title');
        title.setAttribute('class', "showTextOnHighlight")
        title.textContent = item.name
        lockup.appendChild(img)
        lockup.appendChild(overlay)
        lockup.appendChild(title)
        section.appendChild(lockup)
        const that = this
        const handler = function (event) {
            that.showSerial(event.target)
        }
        lockup.addEventListener("play", handler)
        lockup.addEventListener("select", handler)
    }

    showSerial(lockup) {
        const that = this
        replaceDocument(createLoadingDocument("Загрузка"));
        this.api.seasonInfo(function (season) {
            let document = new DOMParser().parseFromString(serial, "application/xml");
            that.createSerialBanner(document, season)
            that.createSeasons(document, season)
            that.createRating(document, season)
            replaceDocument(document)
        }, function (error) {
            replaceDocument(createAlert("Ошибка", error))
        }, lockup.getAttribute('itemID'))
    }


    createSerialBanner(document, serial) {
        let banner = document.getElementsByTagName("banner").item(0)
        banner.appendChild(this.createSerialInfo(document, serial))
        banner.appendChild(this.createSerialStack(document, serial))
        let img = document.createElement("heroImg")
        img.setAttribute('src', serial.poster)
        img.setAttribute('width', 665)
        img.setAttribute('height', 665)
        banner.appendChild(img)

    }

    createSerialInfo(document, serial) {
        let infoList = document.createElement('infoList')

        let info = document.createElement('info')
        let header = document.createElement('header')
        let title = document.createElement('title')
        title.textContent = "Жанры"
        header.appendChild(title)
        info.appendChild(header)
        serial.genre.forEach(function (value) {
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
        serial.country.forEach(function (value) {
            let text = document.createElement('text')
            text.textContent = value
            info.appendChild(text)
        })

        infoList.appendChild(info)
        return infoList
    }

    createSerialStack(document, serial) {
        let that = this
        let stack = document.createElement("stack")
        let title = document.createElement("title")
        title.textContent = serial.name
        stack.appendChild(title)
        let row = document.createElement('row')
        let text = document.createElement('text')
        text.textContent = serial.year
        row.appendChild(text)
        let badge = document.createElement('badge')
        badge.setAttribute('src', 'resource://hd')
        badge.setAttribute('class', 'badge')
        row.appendChild(badge)
        stack.appendChild(row)
        let description = document.createElement('description')
        description.setAttribute('handlesOverflow', true)
        description.textContent = serial.description
        stack.appendChild(description)
        let buttonRow = document.createElement('row')
        let buttonLockupPlay = document.createElement('buttonLockup')
        let badgePlay = document.createElement('badge')
        badgePlay.setAttribute('src', 'resource://button-play')
        let buttonTitlePlay = document.createElement('title')
        buttonTitlePlay.textContent = 'Смотреть'
        buttonLockupPlay.appendChild(badgePlay)
        buttonLockupPlay.appendChild(buttonTitlePlay)
        buttonLockupPlay.addEventListener("play", function (event) {
            that.play(event.target, serial)
        })
        buttonLockupPlay.addEventListener("select", function (event) {
            that.play(event.target, serial)
        })
        let buttonLockupFavorite = document.createElement('buttonLockup')
        let badgeFavorite = document.createElement('badge')
        let src = 'resource://button-add'
        let titleText = 'Я смотрю'
        if (isWatched(serial)) {
            src = 'resource://button-remove'
            titleText = "Не буду смотреть"
        }
        badgeFavorite.setAttribute('src', src)
        let buttonTitleFavorite = document.createElement('title')
        buttonTitleFavorite.textContent = titleText
        buttonLockupFavorite.appendChild(badgeFavorite)
        buttonLockupFavorite.appendChild(buttonTitleFavorite)
        buttonLockupFavorite.addEventListener("play", function (event) {
            that.addFavorite(event.target, serial)
        })
        buttonLockupFavorite.addEventListener("select", function (event) {
            that.addFavorite(event.target, serial)
        })
        buttonRow.appendChild(buttonLockupPlay)
        buttonRow.appendChild(buttonLockupFavorite)
        stack.appendChild(buttonRow)
        return stack
    }

    play(target, serial) {
        let document = new DOMParser().parseFromString(translations, "application/xml");
        const alert = document.getElementsByTagName("alertTemplate").item(0)
        const next = nextEpisode(serial)
        const that = this
        const storedSerial = getSerial(serial)
        let title = document.createElement('title')
        serial.playlist.forEach(function (item) {
            if (item.name == next) {
                let button = document.createElement('button')
                if (storedSerial['translation'] == item.perevod) {
                    button.setAttribute("autoHighlight", true)
                }
                title.textContent = 'Выберите перевод для "' + item.name + '"'
                button.setAttribute("file", item.link)
                let buttonTitle = document.createElement('title')
                buttonTitle.textContent = item.perevod
                button.addEventListener("select", function (event) {
                    navigationDocument.dismissModal();
                    saveSerialTranslation(serial, item.perevod)
                    that.playFile(event.target.getAttribute('file'), serial, item.name)
                })
                button.appendChild(buttonTitle)
                alert.appendChild(button)
            }
        })
        alert.appendChild(title)
        replaceDocument(document)
    }

    playFile(file, serial, name) {
        let document = new DOMParser().parseFromString(seekAlert, "application/xml");
        const mediaList = new Playlist();
        const mediaItem = new MediaItem('video', file);
        mediaList.push(mediaItem)
        const myPlayer = new Player();
        const time = getWatchedEpisodeTime(serial, name)
        myPlayer.addEventListener("stateDidChange", function (event) {
            markAsWatchedEpisode(serial, name, event.elapsedTime, myPlayer.currentMediaItemDuration,)
        })
        myPlayer.addEventListener("transportBarVisibilityDidChange", function (event) {
            if (time > 120) {
                myPlayer.interactiveOverlayDocument = document
                myPlayer.interactiveOverlayDismissable = true
                myPlayer.seekToTime(320)
            }
        })
        myPlayer.addEventListener("timeDidChange", function (event) {
            markAsWatchedEpisode(serial, name, event.time, myPlayer.currentMediaItemDuration)
        }, {interval: 5});
        myPlayer.playlist = mediaList;
        if (time < 120) {
            myPlayer.play()
        } else {
            myPlayer.pause()
        }
    }

    addFavorite(target, serial) {
        let alertDocument = createAlert(serial.name, "Добавлен в закладки");
        let button = target.getElementsByTagName("badge").item(0)
        let title = target.getElementsByTagName("title").item(0)
        if (isWatched(serial)) {
            unwatch(serial)
            button.setAttribute('src', "resource://button-add")
            title.textContent = "Я смотрю"
            alertDocument = createAlert(serial.name, "Удален из закладок");
        } else {
            button.setAttribute('src', "resource://button-remove")
            title.textContent = "Не буду смотреть"
            watch(serial)
        }
        replaceDocument(alertDocument)
    }

    createSeasons(document, season) {
        const that = this
        let header = document.createElement('header')
        let headerTitle = document.createElement('title')
        headerTitle.textContent = 'Сезоны'
        header.appendChild(headerTitle)
        let section = document.createElement('section')
        document.getElementById('seasons').appendChild(header)
        document.getElementById('seasons').appendChild(section)
        if (season.other_season == undefined) {
            section.appendChild(this.createSeason(document, season))
            return
        }
        for (let key in season.other_season) {
            this.api.seasonInfo(function (season) {
                section.appendChild(that.createSeason(document, season))
            }, function (error) {

            }, season.other_season[key])
        }
    }

    createSeason(document, season) {
        const that = this
        const handler = function (event) {
            that.createEpisodes(season)
        }
        const holdHandler = function (event) {
        }
        let lockup = document.createElement('lockup')
        lockup.setAttribute('itemId', season.id)
        lockup.addEventListener('play', handler)
        lockup.addEventListener('select', handler)
        lockup.addEventListener('holdselect', holdHandler)

        let img = document.createElement('img')
        img.setAttribute('src', season.poster_small)
        img.setAttribute('width', 172)
        img.setAttribute('height', 300)
        lockup.appendChild(img)
        let title = document.createElement('title')
        let number = season.season_number
        if (season.season_number == 0) {
            number++
        }
        title.textContent = "Season №" + number
        lockup.appendChild(title)
        return lockup
    }

    createEpisodes(season) {
        let document = new DOMParser().parseFromString(episodes, "application/xml");
        let img = document.createElement("heroImg")
        img.setAttribute('src', season.poster)
        img.setAttribute('width', 556)
        img.setAttribute('height', 556)
        document.getElementById("banner").appendChild(img)
        let title = document.createElement("title")
        title.textContent = season.name
        document.getElementById("header").appendChild(title)
        document.getElementById("description").textContent = season.description
        let list = document.getElementById("list")
        let episodesList = {}
        season.playlist.forEach(function (item, key) {
            if (episodesList[item.name] == undefined) {
                episodesList[item.name] = {}
                episodesList[item.name]['translations'] = []
                episodesList[item.name]['name'] = item.name
            }
            episodesList[item.name]['translations'].push(item.perevod)
        })
        let key = 1;
        for (let episodeName in episodesList) {
            let listItemLockup = document.createElement('listItemLockup')
            listItemLockup.setAttribute('name', episodesList[episodeName]["name"])
            let title = document.createElement('title')
            title.textContent = episodesList[episodeName]["name"]
            let decorationLabel = document.createElement('decorationLabel')
            for (let translation in episodesList[episodeName]["translations"]) {
                decorationLabel.textContent += episodesList[episodeName]["translations"][translation] + " "
            }
            let textBadge = document.createElement('img')
            textBadge.setAttribute('src', "resource://button-checkmark")
            textBadge.setAttribute('contentsMode', "aspectFill")
            textBadge.setAttribute('theme', "light")
            listItemLockup.appendChild(title)
            listItemLockup.appendChild(textBadge)
            listItemLockup.appendChild(decorationLabel)
            list.appendChild(listItemLockup)
            key++
        }

        replaceDocument(document)
    }

    createRating(document, serial) {
        let rating = document.getElementById("rating")
        if (serial.rating == undefined || serial.rating.length == 0) {
            const removeElem = rating.parentNode
            rating.parentNode.parentNode.removeChild(removeElem)
        }
        for (let type in serial.rating) {
            let card = document.createElement('ratingCard')
            let title = document.createElement('title')
            title.textContent = serial.rating[type].ratio + '/ 10'
            let titleType = document.createElement('title')
            titleType.textContent = type
            let ratingBadge = document.createElement('ratingBadge')
            ratingBadge.setAttribute('value', serial.rating[type].ratio / 10)
            let description = document.createElement('description')
            description.textContent = " Среди " + serial.rating[type].votes_count + " голосов"
            card.appendChild(description)
            card.appendChild(titleType)
            card.appendChild(title)
            card.appendChild(ratingBadge)
            rating.appendChild(card)
        }
    }
}
