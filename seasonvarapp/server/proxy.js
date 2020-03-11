class ProxyApi {
    constructor(token, url) {
        this._url = url
        this._token = token;
    }

    serials(success, error) {
        this.request("/serials", {}, "get", success, error);
    }

    serial(id, success, error) {
        this.request("/serials/" + id, {}, "get", success, error);
    }

    my(success, error) {
        this.request("/my", {}, "get", success, error);
    }

    seasons(id, success, error) {
        this.request("/seasons/" + id, {}, "get", success, error);
    }

    episodes(id, success, error) {
        this.request("/" + id + "/episodes", {}, "get", success, error);
    }

    register(key, success, error) {
        this.request("/register/" + key, {}, "get", success, error);
    }

    timing(id, params, success, error) {
        this.request("/timing/" + id, params, "post", success, error);
    }

    watch(id, params, success, error) {
        this.request("/watch/" + id, params, "post", success, error);
    }

    unwatch(id, success, error) {
        this.request("/unwatch/" + id, {}, "get", success, error);
    }

    favorite(id, success, error) {
        this.request("/favorite/" + id, {}, "get", success, error);
    }

    unfavorite(id, success, error) {
        this.request("/unfavorite/" + id, {}, "get", success, error);
    }

    translations(id, success, error) {
        this.request("/translations/" + id, {}, "get", success, error);
    }

    favorites(success, error) {
        this.request("/favorites", {}, "get", success, error);
    }

    episodeTranslations(id, success, error) {
        this.request("/episode/translations/" + id, {}, "get", success, error);
    }

    watchedSeason(id, success, error) {
        this.request("/season/watched/" + id, {}, "get", success, error);
    }

    search(text, success, error) {
        this.request("/search", {'text': text}, "get", success, error);
    }

    request(url, params, method, success, error) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, this._url + url);
        xhr.responseType = "json";
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.setRequestHeader("Api-Key", this._token);
        xhr.onload = () => {
            console.log(xhr.response)
            if (xhr.response.error !== null) {
                error(xhr.response.error)
            }
            success(xhr.response);
        };
        xhr.onerror = () => {
            console.log(xhr.response)
            if (xhr.response == undefined) {
                error(xhr.response)
            } else {
                error(xhr.response.error);
            }
        };
        console.log(JSON.stringify(params))
        xhr.send(JSON.stringify(params));
    }
}