import { AiService, ChatMessage } from './ai.service';
export declare class AiController {
    private readonly ai;
    constructor(ai: AiService);
    status(): {
        live: boolean;
    };
    copilot(propertyId: string, body: {
        messages: ChatMessage[];
        allowWrites?: boolean;
    }): Promise<{
        answer: string;
        grounded: boolean;
        live: boolean;
        toolsUsed: never[];
        model?: undefined;
        chart?: undefined;
    } | {
        answer: string;
        grounded: boolean;
        live: boolean;
        model: string;
        toolsUsed: string[];
        chart: unknown;
    } | {
        answer: string;
        grounded: boolean;
        live: boolean;
        toolsUsed: string[];
        chart: unknown;
        model?: undefined;
    }>;
}
