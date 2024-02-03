class TrackServiceError extends Error {
  code: string

  constructor(message: string, code: any) {
    super(message);
    this.name = "TrackServiceError";
    this.code = code;

    Object.setPrototypeOf(this, TrackServiceError.prototype);
  }
}

export default TrackServiceError;
