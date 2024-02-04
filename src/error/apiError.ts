class ApiError extends Error {
    code: string
    statusCode: number;
  
    constructor(message: string, code: any, statusCode: number) {
      super(message);
      this.name = "ApiError";
      this.code = code;
      this.statusCode = statusCode;
  
      Object.setPrototypeOf(this, ApiError.prototype);
    }
  }
  
export default ApiError;