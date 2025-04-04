
export function getRandomCode(length: number = 27): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

import fs from 'fs';
import path from 'path';
import { IConfigJson } from '../types/Config';
import { ColorResolvable } from 'discord.js';

export function loadConfig(): IConfigJson | null {
    const configPath = path.join(__dirname, '..','..' ,'config.json');
    if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(configData);
    } else {
        console.error('Config file not found.');
        return null;
    }
}

export function beautifyString(str: string): string {
    const beautified = str.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    return beautified
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function getColor(): ColorResolvable {
    const config = loadConfig();
    if (!config) {
        console.error("Config not found. Please contact the admin.");
        return "#000000"; 
    }
    const color = config.slot.embedColor;
    if (color) {
        return color as ColorResolvable;
    } else {
        return "#000000"; // Default color
    }
}