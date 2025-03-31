import * as fs from 'fs';
import * as path from 'path';
import { ISlot, ISlotStatus } from '../types/Slot';

const filePath = path.join(__dirname, "../../DB/slots.json");

class SlotLib {
    private loadSlots(): ISlot[] {
        try {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify([]));
            }
            return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ISlot[];
        } catch (error) {
            console.error(`Error loading slots: ${error}`);
            return [];
        }
    }

    private saveslots(data: any): void {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error saving slots: ${error}`);
        }
    }

    public getSlots(): ISlot[] {
        return this.loadSlots();
    }
    public getSlotByUserId(userId: string): ISlot | undefined {
        const slots = this.loadSlots();
        return slots.find(slot => slot.userId === userId);
    }

    public getSlotByChannelId(channelId: string): ISlot | undefined {
        const slots = this.loadSlots();
        return slots.find(slot => slot.channelid === channelId);
    }

    public addSlot(slot: ISlot): void {
        const slots = this.loadSlots();
        slots.push(slot);
        this.saveslots(slots);
    }
    
    public updateSlot(userId: string, updatedSlot: Partial<ISlot>): void {
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index] = { ...slots[index], ...updatedSlot };
            this.saveslots(slots);
        }
    }

    public deleteSlot(userId: string): void {
        const slots = this.loadSlots();
        const updatedSlots = slots.filter(slot => slot.userId !== userId);
        this.saveslots(updatedSlots);
    }
    public deleteSlotByChannelId(channelId: string): void {
        const slots = this.loadSlots();
        const updatedSlots = slots.filter(slot => slot.channelid !== channelId);
        this.saveslots(updatedSlots);
    }

    public addherePing(userId: string): void {
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index].pings.here.current++;
            this.saveslots(slots);
        }
    }
    public addeveryonePing(userId: string): void {  
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index].pings.everyone.current++;
            this.saveslots(slots);
        }
    }

    public resetPings(userId: string): void {
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index].pings.here.current = 0;
            slots[index].pings.everyone.current = 0;
            this.saveslots(slots);
        }
    }
    public resetAllPings(): void {
        const slots = this.loadSlots();
        slots.forEach(slot => {
            slot.pings.here.current = 0;
            slot.pings.everyone.current = 0;
        });
        this.saveslots(slots);
    }
    public getAllSlots(): ISlot[] {
        return this.loadSlots();
    }
    public getAllSlotsByStatus(status: string): ISlot[] {
        const slots = this.loadSlots();
        return slots.filter(slot => slot.status === status);
    }

    public updateSlotStatus(userId: string, status: ISlotStatus ): void {
        const slots = this.loadSlots();
        const index = slots.findIndex(slot => slot.userId === userId);
        if (index !== -1) {
            slots[index].status = status;
            this.saveslots(slots);
        }
    }
}

export default new SlotLib();