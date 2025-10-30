export interface RewardPenalty {
    id: string;
    name: string;
    type: "reward" | "penalty" | number;
    defaultAmount: number;
    level: 0 | 1 | 2 | string;
    form: string;
    description: string;
}