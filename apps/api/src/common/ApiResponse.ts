export class ApiResponse<TData = unknown, TMeta = unknown> {
  public readonly success: true;
  public readonly message: string;
  public readonly data?: TData;
  public readonly meta?: TMeta;

  constructor(message: string, data?: TData, meta?: TMeta) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}
