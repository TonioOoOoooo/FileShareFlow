import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function AuthButton() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <div className="flex items-center">
      {!isAuthenticated ? (
        // Not logged in state
        <Button 
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
          onClick={login}
        >
          <i className="ri-microsoft-line mr-2"></i>
          Sign in with Microsoft
        </Button>
      ) : (
        // Logged in state
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-4">{user?.name}</span>
          <Avatar className="h-8 w-8">
            {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <button 
            className="ml-2 text-gray-500 hover:text-gray-700"
            onClick={logout}
          >
            <i className="ri-logout-box-r-line"></i>
          </button>
        </div>
      )}
    </div>
  );
}
