function watch(serial) {
    let watchSerial = getSerial(serial)
    watchSerial["watch"] = true;
    saveSerial(watchSerial)
}

function saveSerial(serial) {
    let watchSerial = localStorage.getItem(localWatchKey)
    if (watchSerial != undefined) {
        watchSerial = JSON.parse(localStorage.getItem(localWatchKey))
    } else {
        watchSerial = {}
    }
    watchSerial[serial["name"]] = serial
    localStorage.setItem(localWatchKey, JSON.stringify(watchSerial))
}

function getWathingSerials() {
    let watchSerial = localStorage.getItem(localWatchKey)
    if (watchSerial == null) {
        watchSerial = {}
    } else {
        watchSerial = JSON.parse(watchSerial)
    }
    let watchingSerials = []
    for (let serial in watchSerial) {
        if (watchSerial[serial]["watch"] == true) {
            watchingSerials.push(watchSerial[serial])
        }
    }
    return watchingSerials
}

function getSerial(serial) {
    let watchSerial = localStorage.getItem(localWatchKey)
    if (watchSerial == null) {
        watchSerial = {}
    } else {
        watchSerial = JSON.parse(watchSerial)
    }
    if (watchSerial[serial.name_original] == null) {
        watchSerial[serial.name_original] = {}
        watchSerial[serial.name_original]["name"] = serial.name_original
        watchSerial[serial.name_original]["watch"] = false
        watchSerial[serial.name_original]["watched"] = {}
        watchSerial[serial.name_original]["seasson"] = []
        watchSerial[serial.name_original]["watching_season"] = serial.id
        watchSerial[serial.name_original]["seasson"].push(serial.id)
        if (serial.other_season != undefined && serial.other_season.length > 0) {
            for (let key in serial.other_season) {
                watchSerial[serial.name_original]["seasson"].push(serial.other_season[key])
            }
        }
        saveSerial(watchSerial)
        return watchSerial[serial.name_original]
    }
    watchSerial = JSON.parse(localStorage.getItem(localWatchKey))
    return watchSerial[serial.name_original]
}

function unwatch(serial) {
    let watchSerial = getSerial(serial)
    watchSerial['watch'] = false
    saveSerial(watchSerial)
}

function isWatched(serial) {
    let watchSerial = getSerial(serial)
    if (watchSerial["watch"] == false) {
        return false
    }
    return true;
}

function nextEpisode(serial) {
    let current = getSerial(serial)
    if (current["watched"][serial.season_number] != undefined) {
        for (let key in serial.playlist) {
            if (!current["watched"][serial.season_number].includes(serial.playlist[key].name)) {
                return serial.playlist[key].name
            }
        }
    }
    return serial.playlist[0].name
}

function saveSerialTranslation(serial, translation) {
    let current = getSerial(serial)
    current['translation'] = translation
    saveSerial(current)
}

function getWatchedEpisodeTime(serial, name) {
    let current = getSerial(serial)
    if (current["watched"][serial.season_number] == undefined) {
        return 0
    }
    if (current["watched"][serial.season_number][name] == undefined) {
        return 0
    }
    return current["watched"][serial.season_number][name]["time"]
}

function markAsWatchedEpisode(serial, name, time, duration) {
    let current = getSerial(serial)
    if (current["watched"][serial.season_number] == undefined) {
        current["watched"][serial.season_number] = {}
    }
    let watched = false
    if (duration - time < 120) {
        watched = true
    }
    current["watched"][serial.season_number][name] = {
        "name": name,
        "time": time,
        "duration": duration,
        "watched": watched
    }
}
