/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `` | `/` | `/(auth)` | `/(tabs)` | `/ComingSoon` | `/ContactUs` | `/Disclaimer` | `/Donation` | `/ForgotPassword` | `/HistoryScreen` | `/Home` | `/ProductNotFound` | `/ResultScreen` | `/SignUp` | `/_sitemap` | `/login` | `/profile` | `/scan` | `/scan2` | `/score`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
