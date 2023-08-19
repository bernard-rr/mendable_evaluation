"use strict";
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var fs = require("fs");
var Papa = require("papaparse");
var fast_csv_1 = require("fast-csv");
function generateConversationId() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}
var questionsPerBatch = 6; // Number of questions processed before waiting
var timeoutDuration = 10000; // Duration of the wait in milliseconds
function evaluateQueries(apiKey, filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var csvContent, results, totalQuestions_1, processedCount_1, startTime_1, showProgress, i, question, conversation_id, response, error_1, currentTimestamp, csvOutput, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    csvContent = fs.readFileSync(filePath, 'utf8');
                    results = Papa.parse(csvContent, {
                        header: true,
                        skipEmptyLines: true,
                    }).data;
                    totalQuestions_1 = results.length;
                    processedCount_1 = 0;
                    startTime_1 = Date.now();
                    showProgress = setInterval(function () {
                        var elapsedMinutes = (Date.now() - startTime_1) / 60000;
                        var avgTimePerSet = elapsedMinutes / (processedCount_1 / questionsPerBatch);
                        var setsLeft = (totalQuestions_1 - processedCount_1) / questionsPerBatch;
                        var estimatedTimeLeft = avgTimePerSet * setsLeft;
                        console.log("Progress: ".concat(processedCount_1, "/").concat(totalQuestions_1, " Estimated time left: ").concat(estimatedTimeLeft.toFixed(2), " minutes."));
                    }, 20000);
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < results.length)) return [3 /*break*/, 8];
                    question = results[i].question;
                    conversation_id = generateConversationId();
                    results[i].conversation_id = conversation_id; // Adding conversation_id to the result.
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, axios_1.default.post('https://api.mendable.ai/v0/mendableChat', {
                            question: question,
                            anon_key: apiKey,
                            conversation_id: conversation_id,
                            shouldStream: false
                        })];
                case 3:
                    response = _a.sent();
                    results[i].mendableAnswer = response.data.answer.text;
                    if (!(i % questionsPerBatch === (questionsPerBatch - 1))) return [3 /*break*/, 5];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, timeoutDuration); })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    processedCount_1++;
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("Failed to fetch answer for question: ".concat(question, ". Error:"), error_1);
                    return [3 /*break*/, 7];
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8:
                    clearInterval(showProgress); // Stop showing the progress once all questions are processed.
                    currentTimestamp = new Date().toISOString().replace(/[\W_]+/g, "_");
                    return [4 /*yield*/, (0, fast_csv_1.writeToString)(results, { headers: true })];
                case 9:
                    csvOutput = _a.sent();
                    fs.writeFileSync("".concat(currentTimestamp, "_mendable_eval.csv"), csvOutput);
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _a.sent();
                    console.error('Error:', error_2);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Usage:
evaluateQueries('448a3e47-642b-48be-92d1-d67d0e44221c', '/workspaces/mendable_evaluation/test_perfect_apps_eval.csv')
    .then(function () { return console.log('Done'); })
    .catch(function (err) { return console.error('Error:', err); });
