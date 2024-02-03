class DatabaseError extends Error {
    code: string
  
    constructor(message: string, code: any) {
      super(message);
      this.name = "DatabaseError";
      this.code = code;
  
      Object.setPrototypeOf(this, DatabaseError.prototype);
    }
  }
  
  export default DatabaseError;
  