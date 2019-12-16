class SerialsDocument {
    constructor(api, menuBarFeature) {
        this.api = api
        this.menuBarFeature = menuBarFeature
    }

    search(menuItem) {
        const doc = new DOMParser().parseFromString(search, "application/xml");
        const that = this
        const searchKeyboard = doc.getElementsByTagName('searchField').item(0).getFeature("Keyboard");
        searchKeyboard.onTextChange = function () {
            const text = this.text.trim()
            if (text.length == 0) {
                return
            }
            that.api.search(text.replace(/\s+/g, " "), function (object) {
                let grid = doc.getElementById("resultsGridContainer")
                let section = doc.getElementsByTagName("section").item(0)
                if (section !== undefined) {
                    grid.removeChild(section)
                }
                section = doc.createElement("section")
                grid.appendChild(section)
                object.data.forEach(function (item, index) {
                    const lockup = buildLockupItem(doc, item, index, function (event) {
                        that.showSerial(event.target)
                    })
                    section.appendChild(lockup)
                });
            }, function (error) {
                replaceDocument(createAlert("Ошибка", error))
            })
        };
        this.menuBarFeature.setDocument(doc, menuItem)
    }

    serials(menuItem) {
        this.menuBarFeature.setDocument(createLoadingDocument("Загрузка"), menuItem);
        const that = this
        this.api.serials(function (object) {
                const doc = buildSerialsList(object.data, function (event) {
                    that.showSerial(event.target)
                })
                that.menuBarFeature.setDocument(doc, menuItem);
            },
            function (error) {
                replaceDocument(createAlert("Ошибка", error))
            });
    }

    mySerials(menuItem) {
        this.menuBarFeature.setDocument(createLoadingDocument("Загрузка"), menuItem);
        const that = this
        this.api.my(function (object) {
                const doc = buildSerialsList(object.data, function (event) {
                    that.showSerial(event.target)
                })
                that.menuBarFeature.setDocument(doc, menuItem);
            },
            function (error) {
                replaceDocument(createAlert("Ошибка", error))
            });
    }

    favorites(menuItem) {
        this.menuBarFeature.setDocument(createLoadingDocument("Загрузка"), menuItem);
        const that = this
        this.api.favorites(function (object) {
                const doc = buildSerialsList(object.data, function (event) {
                    that.showSerial(event.target)
                })
                that.menuBarFeature.setDocument(doc, menuItem);
            },
            function (error) {
                console.log(error)
                replaceDocument(createAlert("Ошибка", error))
            });
    }

    showSerial(lockup) {
        const that = this
        replaceDocument(createLoadingDocument("Загрузка"));
        this.api.serial(lockup.getAttribute('itemID'), function (obj) {
            const document = buildSerial(obj.data, function (event) {
                that.play(event.target, obj.data)
            }, function (event) {
                that.addToWatch(event.target, obj.data)
            }, function (event) {
                that.addFavorite(event.target, obj.data)
            })
            that.api.seasons(lockup.getAttribute('itemID'), function (objSeasons) {
                document.getElementById('seasons').appendChild(buildSeasons(document, objSeasons.data, function (event) {
                    that.createEpisodes(obj.data, event.target.getAttribute("itemId"))
                }, function (season) {
                    that.api.watchedSeason(season, function (obj) {

                    }, function (error) {
                        replaceDocument(createAlert("Ошибка", error))
                    })
                }))
            }, function (error) {
                replaceDocument(createAlert("Ошибка", error))
            })
            replaceDocument(document)
        }, function (error) {
            replaceDocument(createAlert("Ошибка", error))
        })
    }


    play(target, serial) {
        if (serial.currentEpisode.time > 100) {
            this.playFile(serial.currentEpisode.path, serial.currentEpisode, serial.translation, serial)
        } else {
            this.chooseEpisodeTranslation(serial.currentEpisode)
        }
    }

    addToWatch(target, serial) {
        const that = this
        let button = target.getElementsByTagName("badge").item(0)
        let title = target.getElementsByTagName("title").item(0)
        if (serial.isWatching == true) {
            that.api.unwatch(serial.id, function () {
                serial.isWatching = false
                button.setAttribute('src', "resource://button-add")
                title.textContent = "Смотрю"
                replaceDocument(createAlert(serial.name, "Больше не смотрю"));
            }, function (error) {
                replaceDocument(createAlert("Ошибка", error))
            })
            return
        }
        this.api.translations(serial.id, function (obj) {
            if (obj.data.length == 1) {
                that.api.watch(serial.id, {
                    "poster": serial.poster,
                    "translation": obj.data[0]
                }, function () {
                    serial.isWatching = true
                    button.setAttribute('src', "resource://button-remove")
                    title.textContent = "Не смотрю"
                    replaceDocument(createAlert(serial.name, "Я смотрю"));
                }, function (error) {
                    replaceDocument(createAlert("Ошибка", error))
                })
            } else {
                let document = new DOMParser().parseFromString(translations, "application/xml");
                const alert = document.getElementsByTagName("alertTemplate").item(0)
                let localTitle = document.createElement('title')
                localTitle.textContent = 'Выберите перевод для "' + serial.name + '"'
                obj.data.forEach(function (item, index) {
                    let localButton = document.createElement('button')
                    let buttonTitle = document.createElement('title')
                    buttonTitle.textContent = item
                    localButton.addEventListener("select", function (event) {
                        that.api.watch(serial.id, {
                            "poster": serial.poster,
                            "translation": item
                        }, function () {
                            serial.isWatching = true
                            button.setAttribute('src', "resource://button-remove")
                            title.textContent = "Не смотрю"
                            navigationDocument.dismissModal();
                            replaceDocument(createAlert(serial.name, "Я смотрю"));
                        }, function (error) {
                            replaceDocument(createAlert("Ошибка", error))
                        })
                    })
                    localButton.appendChild(buttonTitle)
                    alert.appendChild(localButton)
                });
                alert.appendChild(localTitle)
                replaceDocument(document)
            }

        }, function (error) {
            replaceDocument(createAlert("Ошибка", error))
        })
    }


    playFile(file, episode, translation, serial) {
        let document = new DOMParser().parseFromString(seekAlert, "application/xml");
        const mediaList = new Playlist();
        const mediaItem = new MediaItem('video', file);
        mediaItem.description = serial.description
        mediaList.push(mediaItem)
        const myPlayer = new Player();
        const that = this
        document.getElementById("button-yes").addEventListener("play", function () {
            myPlayer.interactiveOverlayDocument = null
            myPlayer.seekToTime(episode.time)
            myPlayer.play()
        })
        document.getElementById("button-yes").addEventListener("select", function () {
            myPlayer.interactiveOverlayDocument = null
            myPlayer.seekToTime(episode.time)
            myPlayer.play()
        })
        document.getElementById("button-no").addEventListener("play", function () {
            myPlayer.interactiveOverlayDocument = null
            myPlayer.play()
        })
        document.getElementById("button-no").addEventListener("select", function () {
            myPlayer.interactiveOverlayDocument = null
            myPlayer.play()
        })
        myPlayer.addEventListener("stateWillChange", function (event) {
            if (event.oldState == 'end' && event.state == 'loading') {
                if (episode.time > 120) {
                    myPlayer.interactiveOverlayDocument = document
                    myPlayer.interactiveOverlayDismissable = true
                }
            }
            if (event.oldState == 'loading' && myPlayer.interactiveOverlayDocument != null) {
                myPlayer.pause()
            }
        })

        // myPlayer.addEventListener("stateDidChange", function (event) {
        //     loadSerial.watchedPoint(name, serial.id, translation, event.elapsedTime, myPlayer.currentMediaItemDuration)
        // })
        myPlayer.addEventListener("timeDidChange", function (event) {
            let watched = false
            if (myPlayer.currentMediaItemDuration - event.time < 600) {
                watched = true
            }
            that.api.timing(episode.id, {
                'time': parseInt(event.time),
                'watched': watched,
                'translation': translation
            }, function () {
                episode.time = parseInt(event.time)
            }, function () {

            })
        }, {interval: 15});
        myPlayer.playlist = mediaList;
        myPlayer.present()
    }

    addFavorite(target, serial) {
        let button = target.getElementsByTagName("badge").item(0)
        let title = target.getElementsByTagName("title").item(0)
        if (serial.isFavorite == true) {
            this.api.unfavorite(serial.id, function () {
                serial.isFavorite = false
                button.setAttribute('src', "resource://button-rate")
                title.textContent = "В избранное"
                replaceDocument(createAlert(serial.name, "Удален из избранного"));
            }, function (error) {
                replaceDocument(createAlert("Ошибка", error))
            })
        } else {
            this.api.favorite(serial.id, function () {
                serial.isFavorite = true
                button.setAttribute('src', "resource://button-rated")
                title.textContent = "Удалить"
                replaceDocument(createAlert(serial.name, "Добавлен в избранное"))
            }, function (error) {
                replaceDocument(createAlert("Ошибка", error))
            })
        }

    }

    createEpisodes(serial, season) {
        const that = this
        this.api.episodes(season, function (obj) {
            const document = buildEpisodesList(serial, obj.data, function (episode) {
                that.chooseEpisodeTranslation(episode)
            }, function (episode) {
                that.api.timing(episode, {'time': 0, 'watched': true, 'translation': 'default'}, function () {

                }, function (error) {
                    replaceDocument(createAlert("Ошибка", error))
                })
            })
            replaceDocument(document)
        }, function (error) {
            replaceDocument(createAlert("Ошибка", error))
        })

    }

    chooseEpisodeTranslation(episode) {
        const that = this
        this.api.episodeTranslations(episode.id, function (obj) {
            let document = new DOMParser().parseFromString(translations, "application/xml");
            const alert = document.getElementsByTagName("alertTemplate").item(0)
            let title = document.createElement('title')
            title.textContent = 'Выберите перевод для "' + episode.name + '"'
            obj.data.forEach(function (item) {
                let button = document.createElement('button')
                if (serial.translation == item.translation) {
                    button.setAttribute("autoHighlight", true)
                }
                button.setAttribute("file", item.path)
                let buttonTitle = document.createElement('title')
                buttonTitle.textContent = item.translation
                button.addEventListener("select", function () {
                    navigationDocument.dismissModal();
                    that.playFile(item.path, episode, item.translation, serial)
                })
                button.appendChild(buttonTitle)
                alert.appendChild(button)
            })
            alert.appendChild(title)
            replaceDocument(document)
        }, function (error) {
            replaceDocument(createAlert("Ошибка", error))
        })
    }
}
