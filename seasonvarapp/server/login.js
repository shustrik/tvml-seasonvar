function login(key, success, error) {
    const api = new Api(key)
    api.genreList(success, error)
}
