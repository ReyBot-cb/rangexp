import { Test, TestingModule } from "@nestjs/testing";
import { HealthService } from "./health.service";

describe("HealthService", () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  describe("check", () => {
    it("should return status ok", () => {
      const result = service.check();

      expect(result.status).toBe("ok");
    });

    it("should return a valid ISO timestamp", () => {
      const result = service.check();

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it("should return a timestamp close to current time", () => {
      const before = new Date().getTime();
      const result = service.check();
      const after = new Date().getTime();

      const timestamp = new Date(result.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });
});
