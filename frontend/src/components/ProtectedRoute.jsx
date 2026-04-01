import {Navigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';

export default function ProtectedRoute({children, requiredRole}) {
    const {user} = useAuth();
    if (!user) return <Navigate to="/" replace />;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : null;
    if(allowedRoles && !allowedRoles.includes(user.role)){
        return <Navigate to={`/dashboard/${user.role}`} replace />;
    }
    return children;
}
