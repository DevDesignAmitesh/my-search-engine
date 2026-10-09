class S3Manager {
  private static instance: S3Manager;

  static getInstance(): S3Manager {
    if (!S3Manager.instance) S3Manager.instance = new S3Manager();
    return S3Manager.instance;
  }
}

export const s3Manager = S3Manager.getInstance();
