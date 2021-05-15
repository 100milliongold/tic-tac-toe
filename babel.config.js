module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            ["module-resolver" , {
                alias : {
                    "@screens" : "./src/screens",
                    "@components" : "./src/components",
                    "@utiles" : "./src/utiles",
                    "@contexts" : "./src/contexts",
                    "@config" : "./src/config",
                    "@assets" : "./assets"
                }
            }]
        ]
    };
};
