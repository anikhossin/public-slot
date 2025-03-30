"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomCode = getRandomCode;
exports.loadConfig = loadConfig;
exports.beautifyString = beautifyString;
function getRandomCode(length = 27) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadConfig() {
    const configPath = path_1.default.join(__dirname, '..', '..', 'config.json');
    if (fs_1.default.existsSync(configPath)) {
        const configData = fs_1.default.readFileSync(configPath, 'utf-8');
        return JSON.parse(configData);
    }
    else {
        console.error('Config file not found.');
        return null;
    }
}
function beautifyString(str) {
    const beautified = str.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    return beautified
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
//# sourceMappingURL=others.js.map