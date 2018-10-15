const nameRegex = /^[a-z0-9]+\-[a-z0-9]+/i;

module.exports.validateExtensionId = function(id) {
    if (!id) {
        return "Missing extension identifier";
    }

    if (!nameRegex.test(id)) {
        return "Invalid extension identifier";
    }

    return true;
}

module.exports.validateNonEmpty = function(name) {
    return name && name.length > 0;
}