"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const filePath = path.join(__dirname, "../../DB/slots.json");
class SlotLib {
    loadSlots() {
        try {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify([]));
            }
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        catch (error) {
            console.error(`Error loading slots: ${error}`);
            return [];
        }
    }
    saveslots(data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error(`Error saving slots: ${error}`);
        }
    }
    getSlots() {
        return this.loadSlots();
    }
    getSlotByUserId(userId) {
        const slots = this.loadSlots();
        return slots.find(slot => slot.userId === userId);
    }
    getSlotByChannelId(channelId) {
        const slots = this.loadSlots();
        return slots.find(slot => slot.channelid === channelId);
    }
    addSlot(slot) {
        const slots = this.loadSlots();
        slots.push(slot);
        this.saveslots(slots);
    }
    updateSlot(userId, updatedSlot) {
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index] = Object.assign(Object.assign({}, slots[index]), updatedSlot);
            this.saveslots(slots);
        }
    }
    deleteSlot(userId) {
        const slots = this.loadSlots();
        const updatedSlots = slots.filter(slot => slot.userId !== userId);
        this.saveslots(updatedSlots);
    }
    deleteSlotByChannelId(channelId) {
        const slots = this.loadSlots();
        const updatedSlots = slots.filter(slot => slot.channelid !== channelId);
        this.saveslots(updatedSlots);
    }
    addherePing(userId) {
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index].pings.here.current++;
            this.saveslots(slots);
        }
    }
    addeveryonePing(userId) {
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index].pings.everyone.current++;
            this.saveslots(slots);
        }
    }
    resetPings(userId) {
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index].pings.here.current = 0;
            slots[index].pings.everyone.current = 0;
            this.saveslots(slots);
        }
    }
    resetAllPings() {
        const slots = this.loadSlots();
        slots.forEach(slot => {
            slot.pings.here.current = 0;
            slot.pings.everyone.current = 0;
        });
        this.saveslots(slots);
    }
    getAllSlots() {
        return this.loadSlots();
    }
    getAllSlotsByStatus(status) {
        const slots = this.loadSlots();
        return slots.filter(slot => slot.status === status);
    }
    updateSlotStatus(userId, status) {
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index].status = status;
            this.saveslots(slots);
        }
    }
}
exports.default = new SlotLib();
//# sourceMappingURL=slot.lib.js.map