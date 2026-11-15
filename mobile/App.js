import React from "react";

import { AuthProvider } from "./src/context/AuthContext";

import {
  NotificationProvider,
} from "./src/context/NotificationContext";

import AppNavigator from "./src/navigation/AppNavigator";
import { CommerceProvider } from "./src/context/CommerceContext";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CommerceProvider><AppNavigator /></CommerceProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
