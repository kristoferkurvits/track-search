require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});


interface Config {
    NODE_ENV: string;
    ACR_TOKEN: string;
}

class AppConfig implements Config {
    NODE_ENV: string;
    ACR_TOKEN: string;

    constructor() {
      this.ACR_TOKEN = process.env.ACR_TOKEN;
    }

    private static instance: AppConfig;
  
    public static getInstance(): AppConfig {
      if (!this.instance) {
        this.instance = new AppConfig();
      }
  
      return this.instance;
    }
  }
  
  export default AppConfig;