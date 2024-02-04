export declare class APIResponse<T> {
    private readonly success;
    private readonly message;
    private readonly data;
    private readonly error;
    constructor(success: boolean, message: string, data?: T | null);
    static success<T>(data: T, message?: string): APIResponse<T>;
    static error<T>(message: string): APIResponse<T>;
    toJSON(): Record<string, any>;
}
