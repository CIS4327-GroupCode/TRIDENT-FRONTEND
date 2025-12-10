import {Navigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';

export default function ProtectedRoute({children, requiredRole}) {
    const {user, loading} = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/" replace />;
    if(requiredRole && user.role !== requiredRole){
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}