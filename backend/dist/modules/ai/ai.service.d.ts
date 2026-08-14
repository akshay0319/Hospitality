import { PrismaService } from '@/prisma/prisma.service';
import { ContextService } from '@/modules/context/context.service';
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export declare class AiService {
    private readonly prisma;
    private readonly context;
    private readonly logger;
    private readonly client;
    private readonly model;
    constructor(prisma: PrismaService, context: ContextService);
    get isLive(): boolean;
    private writeTools;
    private tools;
    private runTool;
    private revenueTrend;
    chat(propertyId: string, messages: ChatMessage[], allowWrites?: boolean): Promise<{
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
    private demoAnswer;
}
