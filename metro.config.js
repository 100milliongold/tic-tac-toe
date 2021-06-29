/* eslint-disable */
/**
 * amplify function 연동시 에러 조치
 */
const blacklist = require("metro-config/src/defaults/blacklist");
module.exports = {
    resolver: {
        blacklistRE: blacklist([/#current-cloud-backend\/.*/])
    },
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: false
            }
        })
    }
};
