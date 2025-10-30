export interface RewardPenaltyDetail {
    id: string;
    employeeId: string;
    employeeFullName: string;
    employeeAvatarUrl: string;
    typeId: string;
    typeName: string;
    kind: "reward" | "penalty";
    defaultAmount: number;
    amountOverride: number;
    finalAmount: number;
    customReason: string;
    decidedAt: string;
    decidedBy: string;
}