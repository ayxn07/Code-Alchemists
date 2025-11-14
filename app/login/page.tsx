import { Suspense } from 'react';
import LoginPage from '@/src/app/components/LoginPage';

export default function Login() {
    return (
        <Suspense fallback={null}>
            <LoginPage />
        </Suspense>
    );
}
