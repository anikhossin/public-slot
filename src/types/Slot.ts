
export type ISlotStatus = "active" | "hold" | "revoked" | "about_to_expire" | "expired"

export interface ISlot {
    userId: string;
    channelid: string;
    restoreCode: string;
    status: ISlotStatus;
    pings: {
        "here": {
            "max": number;
            "current": number;
        }
        "everyone": {
            "max": number;
            "current": number;
        }
    }
    createdAt: string;
    expiresAt: string;
    lastPing: string;
}