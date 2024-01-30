class AuthenticationError extends Error {
    code: string
  
    constructor(message: string, code: any) {
      super(message);
      this.name = "AuthenticationError";
      this.code = code;
  
      Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
  }
  
  export default AuthenticationError;
  