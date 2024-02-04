require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});


interface Config {
    NODE_ENV: string;
    ACR_TOKEN: string;
    ACR_BASE_URL: string;
    JWT_SECRET: string;
    DB_URL: string;
}

class AppConfig implements Config {
    NODE_ENV: string;
    ACR_TOKEN: string;
    ACR_BASE_URL: string;
    JWT_SECRET: string;
    DB_URL: string;

    constructor() {
      this.NODE_ENV = process.env.NODE_ENV;
      this.ACR_TOKEN = process.env.ACR_TOKEN;
      this.ACR_BASE_URL = process.env.ACR_BASE_URL;
      this.JWT_SECRET = process.env.JWT_SECRET;
      this.DB_URL = process.env.DB_URL;
    }

    private static instance: AppConfig;

    public isProduction(): boolean {
      return this.NODE_ENV === "production";
    }
  
    public static getInstance(): AppConfig {
      if (!this.instance) {
        this.instance = new AppConfig();
      }
  
      return this.instance;
    }
  }
  
  export default AppConfig;