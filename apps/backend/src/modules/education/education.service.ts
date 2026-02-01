import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateEducationModuleDto,
  SubmitQuizDto,
  ModuleQueryDto,
  MarkCompletedDto,
} from "./dto/education.dto";

@Injectable()
export class EducationService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ModuleQueryDto) {
    const where: any = {};

    if (query.level) {
      where.level = query.level;
    }

    return this.prisma.educationModule.findMany({
      where,
      orderBy: { order: "asc" },
    });
  }

  async findById(id: string) {
    const module = await this.prisma.educationModule.findUnique({
      where: { id },
    });

    if (!module) {
      throw new NotFoundException("Education module not found");
    }

    return module;
  }

  async findByCode(code: string) {
    const module = await this.prisma.educationModule.findUnique({
      where: { code },
    });

    if (!module) {
      throw new NotFoundException("Education module not found");
    }

    return module;
  }

  async getUserProgress(userId: string, moduleId: string) {
    const progress = await this.prisma.educationProgress.findUnique({
      where: {
        userId_moduleId: { userId, moduleId },
      },
    });

    return progress;
  }

  async getAllUserProgress(userId: string) {
    return this.prisma.educationProgress.findMany({
      where: { userId },
      include: {
        module: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async markAsCompleted(userId: string, moduleId: string, dto: MarkCompletedDto) {
    const module = await this.findById(moduleId);

    let progress = await this.getUserProgress(userId, moduleId);

    if (progress) {
      // Update existing progress
      progress = await this.prisma.educationProgress.update({
        where: {
          userId_moduleId: { userId, moduleId },
        },
        data: {
          completed: true,
          completedAt: new Date(),
          score: dto.score,
        },
        include: {
          module: true,
        },
      });
    } else {
      // Create new progress
      progress = await this.prisma.educationProgress.create({
        data: {
          userId,
          moduleId,
          completed: true,
          completedAt: new Date(),
          score: dto.score,
        },
        include: {
          module: true,
        },
      });
    }

    return progress;
  }

  async submitQuiz(userId: string, moduleId: string, dto: SubmitQuizDto) {
    const module = await this.findById(moduleId);

    if (module.type !== "quiz") {
      throw new BadRequestException("This module is not a quiz");
    }

    // Simple quiz scoring - in production, this would validate answers against correct ones
    const score = dto.score || this.calculateQuizScore(dto.answers, module.content);

    await this.markAsCompleted(userId, moduleId, { score });

    return {
      module,
      score,
      passed: score >= 70,
      xpEarned: score >= 70 ? module.xpReward : 0,
    };
  }

  private calculateQuizScore(answers: Record<string, any>, content: any): number {
    // Simple scoring - returns a mock score for MVP
    // In production, compare answers with correct answers from content
    return 100; // Placeholder
  }

  async seedModules() {
    const modules = [
      {
        code: "BASIC_01",
        title: "Introducción a la Glucemia",
        description: "Aprende los conceptos básicos sobre la glucemia y por qué es importante monitorearla.",
        level: 1,
        type: "content",
        content: {
          sections: [
            {
              title: "¿Qué es la glucemia?",
              text: "La glucemia es la cantidad de glucosa (azúcar) en tu sangre.",
            },
            {
              title: "Importancia del monitoreo",
              text: "Monitorear tu glucemia te ayuda a entender cómo tu cuerpo procesa los alimentos.",
            },
          ],
        },
        xpReward: 50,
        order: 1,
      },
      {
        code: "BASIC_02",
        title: "Valores Normales",
        description: "Aprende cuáles son los rangos normales de glucemia.",
        level: 1,
        type: "content",
        content: {
          sections: [
            {
              title: "Rangos típicos",
              text: "En ayunas: 70-100 mg/dL. Después de comer: menos de 140 mg/dL.",
            },
          ],
        },
        xpReward: 50,
        order: 2,
      },
      {
        code: "INTERMEDIATE_01",
        title: "Factores que Afectan la Glucemia",
        description: "Descubre qué factores pueden influir en tus niveles de glucosa.",
        level: 2,
        type: "content",
        content: {
          sections: [
            {
              title: "Alimentos",
              text: "Los carbohidratos tienen el mayor impacto en la glucemia.",
            },
            {
              title: "Ejercicio",
              text: "El ejercicio ayuda a reducir los niveles de glucosa.",
            },
            {
              title: "Estrés",
              text: "El estrés puede elevar los niveles de glucosa.",
            },
          ],
        },
        xpReward: 75,
        order: 3,
      },
      {
        code: "QUIZ_01",
        title: "Quiz: Conceptos Básicos",
        description: "Pon a prueba tus conocimientos sobre glucemia.",
        level: 1,
        type: "quiz",
        content: {
          questions: [
            {
              id: "q1",
              question: "¿Cuál es el rango normal de glucemia en ayunas?",
              options: ["50-70 mg/dL", "70-100 mg/dL", "120-150 mg/dL"],
              correctAnswer: "70-100 mg/dL",
            },
            {
              id: "q2",
              question: "¿Qué nutriente afecta más la glucemia?",
              options: ["Proteínas", "Grasas", "Carbohidratos"],
              correctAnswer: "Carbohidratos",
            },
          ],
        },
        xpReward: 100,
        order: 4,
      },
    ];

    for (const module of modules) {
      await this.prisma.educationModule.upsert({
        where: { code: module.code },
        update: module,
        create: module,
      });
    }

    return { seeded: modules.length };
  }
}
