import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Add any providers here (Theme, Cart, Auth, etc.)
  return render(ui, { ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };