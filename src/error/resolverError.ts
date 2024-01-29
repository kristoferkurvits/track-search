class ResolverError extends Error {
  code: string

  constructor(message: string, code: any) {
    super(message);
    this.name = "ResolverError";
    this.code = code;

    Object.setPrototypeOf(this, ResolverError.prototype);
  }
}

export default ResolverError;
