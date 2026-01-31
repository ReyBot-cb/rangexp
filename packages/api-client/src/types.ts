// RangeXp API Types - Auto-generated placeholder
// These should be generated from OpenAPI spec

export type paths = {
  '/v1/auth/login': {
    post: {
      requestBody: { email: string; password: string };
      responses: {
        200: { accessToken: string; refreshToken: string; user: any };
        400: { message: string };
      };
    };
  };
  '/v1/auth/register': {
    post: {
      requestBody: { email: string; password: string; firstName: string; lastName?: string };
      responses: {
        200: { accessToken: string; refreshToken: string; user: any };
        400: { message: string };
      };
    };
  };
  '/v1/auth/me': {
    get: {
      responses: { 200: any };
    };
  };
  '/v1/glucose': {
    get: {
      query: { page?: number; limit?: number };
      responses: { 200: { data: any[]; total: number; page: number } };
    };
    post: {
      requestBody: { value: number; context?: string; note?: string };
      responses: { 200: any };
    };
  };
  '/v1/gamification/xp': {
    post: {
      requestBody: { amount: number; source: string };
      responses: { 200: any };
    };
  };
  '/v1/achievements': {
    get: {
      responses: { 200: any[] };
    };
  };
  '/v1/social/friends': {
    get: {
      responses: { 200: any[] };
    };
  };
  '/v1/social/activity': {
    get: {
      responses: { 200: any[] };
    };
  };
};
