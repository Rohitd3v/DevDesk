import { execSync } from 'child_process';

try {
  // Run TypeScript compiler
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');

  // Run tsc-alias
  execSync('npx tsc-alias', { stdio: 'inherit' });
  console.log('✅ Path aliases resolved');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}