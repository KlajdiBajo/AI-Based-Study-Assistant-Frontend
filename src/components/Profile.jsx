import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = ({ user }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  }

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return "U";
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return first + last;
  };

  // Helper function to get full name
  const getFullName = (firstName, lastName) => {
    if (!firstName && !lastName) return "User";
    return `${firstName || ""} ${lastName || ""}`.trim();
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="hidden md:block space-y-1">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-lg p-2 transition-colors"
      onClick={handleProfileClick}
      title="Go to Profile"
    >
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium ${
            user?.profilePicture ? 'hidden' : 'flex'
          }`}
        >
          {getInitials(user?.firstName, user?.lastName)}
        </div>
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-medium text-foreground">
          {getFullName(user?.firstName, user?.lastName)}
        </p>
        <p className="text-xs text-muted-foreground">
          {user?.email || "Loading..."}
        </p>
      </div>
    </div>
  );
};

export default Profile;