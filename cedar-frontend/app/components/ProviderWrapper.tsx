"use client"; // Ensures Redux works in Next.js App Router (app directory)

import { Provider } from "react-redux";
import { store } from "../store";

interface ProviderWrapperProps {
  children: React.ReactNode;
}

const ProviderWrapper: React.FC<ProviderWrapperProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ProviderWrapper;
