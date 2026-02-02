import { Test, TestingModule } from "@nestjs/testing";
import { GlucoseController } from "./glucose.controller";
import { GlucoseService } from "./glucose.service";
import { GlucoseUnit, GlucoseContext } from "./dto/glucose.dto";

describe("GlucoseController", () => {
  let controller: GlucoseController;
  let glucoseService: jest.Mocked<GlucoseService>;

  const mockGlucoseService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getStats: jest.fn(),
    getLatestReadings: jest.fn(),
  };

  const mockReading = {
    id: "reading-1",
    userId: "user-1",
    value: 120,
    unit: GlucoseUnit.MG_DL,
    note: "After lunch",
    recordedAt: new Date().toISOString(),
    context: GlucoseContext.AFTER_MEAL,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlucoseController],
      providers: [
        { provide: GlucoseService, useValue: mockGlucoseService },
      ],
    }).compile();

    controller = module.get<GlucoseController>(GlucoseController);
    glucoseService = module.get(GlucoseService);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new glucose reading", async () => {
      const req = { user: { id: "user-1" } };
      const createDto = {
        value: 120,
        unit: GlucoseUnit.MG_DL,
        note: "After lunch",
        context: GlucoseContext.AFTER_MEAL,
      };

      mockGlucoseService.create.mockResolvedValue(mockReading);

      const result = await controller.create(req, createDto);

      expect(result).toEqual(mockReading);
      expect(mockGlucoseService.create).toHaveBeenCalledWith("user-1", createDto);
    });
  });

  describe("findAll", () => {
    it("should return paginated readings", async () => {
      const req = { user: { id: "user-1" } };
      const query = { page: 1, limit: 20 };
      const expectedResult = {
        data: [mockReading],
        meta: { total: 1, page: 1, limit: 20, pages: 1 },
      };

      mockGlucoseService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(req, query);

      expect(result).toEqual(expectedResult);
      expect(mockGlucoseService.findAll).toHaveBeenCalledWith("user-1", query);
    });

    it("should pass date filters to service", async () => {
      const req = { user: { id: "user-1" } };
      const query = {
        page: 1,
        limit: 20,
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      };

      mockGlucoseService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(req, query);

      expect(mockGlucoseService.findAll).toHaveBeenCalledWith("user-1", query);
    });
  });

  describe("getStats", () => {
    it("should return glucose statistics with default days", async () => {
      const req = { user: { id: "user-1" } };
      const expectedStats = {
        average: 120,
        min: 100,
        max: 140,
        readingsCount: 10,
        inRangePercentage: 80,
      };

      mockGlucoseService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats(req, undefined);

      expect(result).toEqual(expectedStats);
      expect(mockGlucoseService.getStats).toHaveBeenCalledWith("user-1", 7);
    });

    it("should return glucose statistics with custom days", async () => {
      const req = { user: { id: "user-1" } };
      const expectedStats = {
        average: 115,
        min: 95,
        max: 145,
        readingsCount: 30,
      };

      mockGlucoseService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats(req, 30);

      expect(result).toEqual(expectedStats);
      expect(mockGlucoseService.getStats).toHaveBeenCalledWith("user-1", 30);
    });
  });

  describe("getLatest", () => {
    it("should return latest readings with default limit", async () => {
      const req = { user: { id: "user-1" } };
      const expectedReadings = [mockReading];

      mockGlucoseService.getLatestReadings.mockResolvedValue(expectedReadings);

      const result = await controller.getLatest(req, undefined);

      expect(result).toEqual(expectedReadings);
      expect(mockGlucoseService.getLatestReadings).toHaveBeenCalledWith("user-1", 5);
    });

    it("should return latest readings with custom limit", async () => {
      const req = { user: { id: "user-1" } };
      const expectedReadings = [mockReading, mockReading, mockReading];

      mockGlucoseService.getLatestReadings.mockResolvedValue(expectedReadings);

      const result = await controller.getLatest(req, 10);

      expect(result).toEqual(expectedReadings);
      expect(mockGlucoseService.getLatestReadings).toHaveBeenCalledWith("user-1", 10);
    });
  });

  describe("findById", () => {
    it("should return a specific reading", async () => {
      const req = { user: { id: "user-1" } };

      mockGlucoseService.findById.mockResolvedValue(mockReading);

      const result = await controller.findById(req, "reading-1");

      expect(result).toEqual(mockReading);
      expect(mockGlucoseService.findById).toHaveBeenCalledWith("user-1", "reading-1");
    });
  });

  describe("update", () => {
    it("should update a glucose reading", async () => {
      const req = { user: { id: "user-1" } };
      const updateDto = { value: 130, note: "Updated note" };
      const updatedReading = { ...mockReading, ...updateDto };

      mockGlucoseService.update.mockResolvedValue(updatedReading);

      const result = await controller.update(req, "reading-1", updateDto);

      expect(result).toEqual(updatedReading);
      expect(mockGlucoseService.update).toHaveBeenCalledWith("user-1", "reading-1", updateDto);
    });
  });

  describe("delete", () => {
    it("should delete a glucose reading", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = { message: "Reading deleted successfully" };

      mockGlucoseService.delete.mockResolvedValue(expectedResult);

      const result = await controller.delete(req, "reading-1");

      expect(result).toEqual(expectedResult);
      expect(mockGlucoseService.delete).toHaveBeenCalledWith("user-1", "reading-1");
    });
  });
});
