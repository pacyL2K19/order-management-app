declare class Database {
    private uri;
    private static instance;
    constructor(uri: string);
    static getInstance(uri: string): Database;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
export default Database;
