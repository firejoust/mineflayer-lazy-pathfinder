let inject = (bot: Types.Bot.t) => {
    let config = ref(Types.Path.Options.defaults)

    let setOptions = (options) => {
        config := Types.Path.Options.unwrap(options)
    }

    let getPath = () => {
        ()
    }

    {
        "setOptions": setOptions,
        "getPath": getPath
    }
}