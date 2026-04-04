import {Navigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import {getDefaultRouteForRole, hasPermission} from '../auth/permissions';

export default function ProtectedRoute({children, requiredRole, requiredPermission}) {
    const {user, loading} = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/" replace />;
    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
        return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
    }
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : null;
    if(allowedRoles && !allowedRoles.includes(user.role)){
        return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
    }
    return children;
}
