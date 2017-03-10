import common = require("./ol3-fun/common");
import navigation = require("./ol3-fun/navigation");
import dms = require("./ol3-fun/parse-dms");

let index = common.defaults(common, {
    dms: dms,
    navigation: navigation
});

export = index;