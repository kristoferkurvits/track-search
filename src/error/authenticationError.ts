class AuthenticationError extends Error {
    code: string;
    statusCode: number;
  
    constructor(message: string, code: any) {
      super(message);
      this.name = "AuthenticationError";
      this.code = code;
      this.statusCode = 403;
  
      Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
  }
  
  export default AuthenticationError;
  