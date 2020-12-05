var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("index", ["require", "exports", "axios"], function (require, exports, axios_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    axios_1 = __importDefault(axios_1);
    var DEBUG = false;
    var gitUsername = process.argv.slice(2)[0];
    if (!gitUsername) {
        console.log('No github username was given.');
        process.exit(0);
    }
    var GH_TOKEN = '132affe34d6cb8a21b448b92028b171416a1dec6';
    var GIT_HUB_URL = 'https://api.github.com';
    axios_1.default.defaults.headers.common = { 'Authorization': "bearer " + GH_TOKEN };
    /**
     * Retrieve all repositories from a given GH user
     * by his id (login)
     *
     * @param {string} gitUsername
     * @returns {github.Repository[]} repositories
     */
    var getUserRepositories = function (gitUsername) { return __awaiter(void 0, void 0, void 0, function () {
        var res, result, error_1, axiosError;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get(GIT_HUB_URL + "/users/" + gitUsername + "/repos")];
                case 1:
                    res = _c.sent();
                    result = res.data;
                    if (DEBUG)
                        console.log('get user repositories');
                    return [2 /*return*/, result];
                case 2:
                    error_1 = _c.sent();
                    axiosError = error_1;
                    if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                        console.log('No github username was found.');
                        process.exit(0);
                    }
                    if (((_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.status) === 403) {
                        console.log('Too much requests to github without authentication.');
                        process.exit(0);
                    }
                    else {
                        if (DEBUG)
                            console.log('Error in get user repositories');
                        throw new Error(error_1);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Get only public repositories of a given repositories collection.
     *
     * @param {github.Repository[]} repositories
     */
    var filterPublicRepositories = function (repositories) {
        var publicRepositories = repositories.filter(function (repo) { return repo.private === false; });
        if (!publicRepositories.length) {
            console.log('No public repositories found.');
            process.exit(0);
        }
        return publicRepositories;
    };
    /**
     * Get contribution of a given github user
     * filtering all contributions by his id (login)
     *
     * @param {github.Contributor[]} contributors
     * @param {string} login
     */
    var getUserContributionToThisRepository = function (contributors, login) { return contributors.filter(function (contributor) { return contributor.author.login === login; }); };
    /**
     * This function creates a collection of object in the form of
     * { language: repository[] }
     *
     * @param {github.Repository[]} repositories
     * @returns {LanguageList}
     */
    var createUserLanguageList = function (repositories) {
        var languageRepartition = {};
        repositories.forEach(function (repository) {
            if (repository.language) {
                if (Array.isArray(languageRepartition[repository.language])) {
                    languageRepartition[repository.language].push(repository.full_name);
                }
                else {
                    languageRepartition[repository.language] = [repository.full_name];
                }
            }
        });
        if (!Object.keys(languageRepartition).length)
            throw new Error('User languages are undefined');
        return languageRepartition;
    };
    /**
     * This functions gets all contributions to a given repository,
     * then it filters the contributions of a given user
     * and then returns the number of lines that the user wrote (or deleted)
     * the reduce part is taken from a stackoverflow question:
     * https://stackoverflow.com/questions/26881441/can-you-get-the-number-of-lines-of-code-from-a-github-repository
     * and is probably wrong (maybe should take into account other weeks?).
     *
     * @param {string} language
     * @param {string} repositoryName
     * @param {string} gitUsername
     * @returns {Promise<number>}
     */
    var getCodeLinesFromRepository = function (language, repositoryName, gitUsername) { return __awaiter(void 0, void 0, void 0, function () {
        var res, contributors, userContributions, lines, positiveLines, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get(GIT_HUB_URL + "/repos/" + repositoryName + "/stats/contributors")];
                case 1:
                    res = _a.sent();
                    contributors = res.data;
                    userContributions = getUserContributionToThisRepository(contributors, gitUsername);
                    if (!userContributions.length) {
                        if (DEBUG)
                            console.log(repositoryName + " is in " + language + " has no contribution from this user");
                        return [2 /*return*/, 0];
                    }
                    lines = userContributions.map(function (contributor) { return contributor.weeks
                        .reduce(function (lineCount, week) { return lineCount + week.a - week.d; }, 0); })
                        .reduce(function (lineTotal, lineCount) { return lineTotal + lineCount; });
                    positiveLines = Math.abs(lines);
                    if (DEBUG)
                        console.log(repositoryName + " is in " + language + " and has " + positiveLines + " lines");
                    return [2 /*return*/, positiveLines];
                case 2:
                    error_2 = _a.sent();
                    if (DEBUG)
                        console.log('Error in get Code Lines From Repository');
                    throw new Error(error_2);
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * This function iterates an array of languages and its array of repositories
     *
     *
     * @param {LanguageList} languageList
     * @param {string} gitUsername
     * @returns {Promise<LanguageList>[]}
     */
    var getCodeLinesForAllLanguages = function (languageList, gitUsername) {
        var languages = Object.keys(languageList);
        return Promise.all(languages.map(function (language) { return __awaiter(void 0, void 0, void 0, function () {
            var linesPerRepository;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all(languageList[language].map(function (repositoryName) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, getCodeLinesFromRepository(language, repositoryName, gitUsername)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); }))];
                    case 1:
                        linesPerRepository = _b.sent();
                        return [2 /*return*/, (_a = {}, _a[language] = linesPerRepository, _a)];
                }
            });
        }); }));
    };
    /**
     * Sum the line of code of every language type
     *
     * @param {LanguageCodeLines[]} languages
     * @returns {[string, number][]}
     */
    var sumLinesOfCodePerLanguage = function (languages) { return languages.map(function (language) {
        var _a = Object.entries(language)[0], languageName = _a[0], codeLines = _a[1];
        var sumOfCodeLines = codeLines.reduce(function (lineTotal, lineCount) { return lineTotal + lineCount; });
        return [languageName, sumOfCodeLines];
    }); };
    /**
     * Sort list by code line quantity
     *
     * @param {[string, number][]} languages
     */
    var reorderListByCodeLineQuantity = function (languages) { return __spreadArrays(languages.sort(function (a, b) { return b[1] - a[1]; })); };
    /**
     * Print list in console
     *
     * @param {[string, number][]} printableList
     * @param {string} gitUsername
     */
    var printList = function (printableList, gitUsername) {
        console.log("Language repartition for " + gitUsername);
        printableList.forEach(function (_a) {
            var languageName = _a[0], sumOfCodeLines = _a[1];
            console.log("* " + sumOfCodeLines + ": " + languageName);
        });
    };
    var init = function (gitUsername) { return __awaiter(void 0, void 0, void 0, function () {
        var userRepositories, userPublicRepositories, userLanguageList, listOfLanguagesAndCorrespondingCodeLines, unorderedPrintableList, orderedPrintableList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getUserRepositories(gitUsername)];
                case 1:
                    userRepositories = _a.sent();
                    userPublicRepositories = filterPublicRepositories(userRepositories);
                    userLanguageList = createUserLanguageList(userPublicRepositories);
                    return [4 /*yield*/, getCodeLinesForAllLanguages(userLanguageList, gitUsername)];
                case 2:
                    listOfLanguagesAndCorrespondingCodeLines = _a.sent();
                    unorderedPrintableList = sumLinesOfCodePerLanguage(listOfLanguagesAndCorrespondingCodeLines);
                    orderedPrintableList = reorderListByCodeLineQuantity(unorderedPrintableList);
                    printList(orderedPrintableList, gitUsername);
                    return [2 /*return*/];
            }
        });
    }); };
    init(gitUsername);
});
