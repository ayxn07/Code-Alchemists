import { Suspense } from 'react';
import LoginPage from '@/src/app/components/LoginPage';

export default function Register() {
    return (
        <Suspense fallback={null}>
            <LoginPage />
        </Suspense>
    );
}
