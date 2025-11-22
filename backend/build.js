import { execSync } from 'child_process';

try {
  // Run TypeScript compiler
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}