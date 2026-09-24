import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      success: true,
      service: "Bangladesh Restaurant API",
      status: "healthy",
      environment: process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString(),
    };
  }
}
