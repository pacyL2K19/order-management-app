export class APIResponse<T> {
  private readonly success: boolean;
  private readonly message: string;
  private readonly data: T | null;
  private readonly error: string | null;

  constructor(success: boolean, message: string, data: T | null = null) {
    this.success = success;
    this.message = message;
    this.error = null;
    this.data = data;
  }

  static success<T>(data: T, message: string = "Success"): APIResponse<T> {
    return new APIResponse(true, message, data);
  }

  static error<T>(message: string): APIResponse<T> {
    return new APIResponse(false, message);
  }

  toJSON(): Record<string, any> {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
    };
  }
}
