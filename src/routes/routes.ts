export const routes = {
  public: {
    home: '/',
    login: '/auth/login',
    signup: '/auth/signup',
  },
  private: {
    dashboard: {
      root: '/dashboard',
      ask: '/dashboard/ask',
      upload: '/dashboard/upload',
      resources: '/dashboard/resources',
      history: '/dashboard/history',
      settings: '/dashboard/settings',
    }
  }
} as const;

export type Routes = typeof routes;
export type PublicRoutes = keyof typeof routes.public;
export type PrivateRoutes = keyof typeof routes.private.dashboard;
