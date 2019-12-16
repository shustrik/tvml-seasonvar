class Api {
    constructor(token) {
        this._url = "http://api.seasonvar.ru/"
        this._token = token;
    }

    updateList(success, error, dayCount = 3, seasonInfo = false) {
        this.request({
            'command': 'getUpdateList',
            'day_count': dayCount,
            'seasonInfo': seasonInfo,
            'key': this._token
        }, success, error);
    }

    seasonInfo(success, error, id) {
        this.request({
            'command': 'getSeason',
            'season_id': id,
            'key': this._token
        }, success, error);
    }

    search(success, error, text) {
        this.request({
            'command': 'search',
            'query': text   ,
            'key': this._token
        }, success, error);
    }

    genreList(success, error) {
        this.request({
            'command': 'getGenreList',
            'key': this._token
        }, success, error);
    }
    request(params, success, error) {
        let paramsArray = new Array();
        for (let prop in params) {
            paramsArray.push(prop + "=" + params[prop])
        }
        ;
        const xhr = new XMLHttpRequest();
        xhr.open("post", this._url);
        xhr.responseType = "json";
        xhr.onload = () => {
            if (xhr.response.error !== undefined) {
                error(xhr.response.error)
            }
            success(xhr.response);
        };
        xhr.onerror = () => {
            error(xhr.response);
        };
        xhr.send(paramsArray.join('&'));
    }
}

