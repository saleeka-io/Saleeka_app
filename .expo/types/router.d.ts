/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/Disclaimer` | `/(auth)/ForgotPassword` | `/(auth)/Home` | `/(auth)/SignUp` | `/(auth)/login` | `/(tabs)` | `/(tabs)/HistoryScreen` | `/(tabs)/ProductNotFound` | `/(tabs)/ResultScreen` | `/(tabs)/profile` | `/(tabs)/scan` | `/ComingSoon` | `/ContactUs` | `/Disclaimer` | `/Donation` | `/ForgotPassword` | `/HistoryScreen` | `/Home` | `/ProductNotFound` | `/ResultScreen` | `/SignUp` | `/_sitemap` | `/login` | `/profile` | `/scan` | `/score`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
