class TrackServiceError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: any, statusCode: number) {
    super(message);
    this.name = "TrackServiceError";
    this.code = code;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, TrackServiceError.prototype);
  }
}

export default TrackServiceError;
