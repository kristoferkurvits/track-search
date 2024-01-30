class ApiError extends Error {
    code: string
  
    constructor(message: string, code: any) {
      super(message);
      this.name = "ApiError";
      this.code = code;
  
      Object.setPrototypeOf(this, ApiError.prototype);
    }
  }
  
export default ApiError;