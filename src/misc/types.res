module Bot = {
    type t = {

    }

    type pathfinder = {
        createPath: unit => unit,
        followPath: unit => unit,
        goto: unit => unit
    }

    let inject: (t, string, pathfinder) => unit = %raw("(object, key, value) => object[key] = value")
}