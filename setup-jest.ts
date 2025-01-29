import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

interface CustomMatchers<R = unknown> {
	toHaveTextContent(content: string | RegExp): R;
	toBeInTheDocument(): R;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface JestMatchers<R> extends CustomMatchers<R> {}
}
