import {Navigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';

export default function ProtectedRoute({children, requiredRole}) {
    const {user} = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if(requiredRole) {
        const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowed.includes(user.role)) {
            return <Navigate to="/" replace />;
        }
    }
    return children;
}