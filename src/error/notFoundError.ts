class NotFoundError extends Error {
    code: string;
    statusCode: number;
  
    constructor(message: string, code: any) {
      super(message);
      this.name = "TrackServiceError";
      this.code = code;
      this.statusCode = 404;
  
      Object.setPrototypeOf(this, NotFoundError.prototype);
    }
  }
  
  export default NotFoundError;
  