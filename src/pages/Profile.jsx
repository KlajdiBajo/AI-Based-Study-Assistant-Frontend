import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Mail, Phone, User } from "lucide-react";
import { useAuthStore } from "../store";
import { api } from "../lib"; // Import your api instance

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const [fullProfile, setFullProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching full profile from backend...");

        const response = await api.get("/api/v1/myProfile");

        console.log("Full profile response:", response.data);
        setFullProfile(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
        // Fallback to auth user data
        setFullProfile(authUser);
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) {
      fetchFullProfile();
    } else {
      setIsLoading(false);
    }
  }, [authUser]);

  // Use full profile if available, fallback to auth user
  const user = fullProfile || authUser;

  const getFullName = () => {
    if (!user) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  };

  const getInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : "";
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : "";
    return first + last;
  };

  const formatGender = (gender) => {
    if (!gender) return "Not specified";
    if (typeof gender === "object" && gender.name) {
      return (
        gender.name.charAt(0).toUpperCase() + gender.name.slice(1).toLowerCase()
      );
    }
    return (
      gender.toString().charAt(0).toUpperCase() +
      gender.toString().slice(1).toLowerCase()
    );
  };

  const formatMemberSince = (createdAt) => {
    if (!createdAt) return "June 2025"; // Default for existing users

    try {
      const date = new Date(createdAt);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Recently";
    }
  };

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log("Final user object:", user);
      console.log("Phone number:", user?.phoneNumber);
      console.log("Gender:", user?.gender);
      console.log("All properties:", Object.keys(user || {}));
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center p-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center p-8">
          <p className="text-red-500">Failed to load profile data</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        {error && (
          <p className="text-yellow-600 text-sm">Some data may be incomplete</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold ${
                    user?.profilePicture ? "hidden" : "flex"
                  }`}
                >
                  {getInitials()}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {getFullName()}
              </h2>
              <p className="text-muted-foreground">Student</p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {formatMemberSince(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name
                </label>
                <p className="flex items-center space-x-2 text-foreground bg-muted px-3 py-2 rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{user.firstName || "Not provided"}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name
                </label>
                <p className="flex items-center space-x-2 text-foreground bg-muted px-3 py-2 rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{user.lastName || "Not provided"}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <p className="flex items-center space-x-2 text-foreground bg-muted px-3 py-2 rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user.email || "Not provided"}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <p className="flex items-center space-x-2 text-foreground bg-muted px-3 py-2 rounded-lg">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{user.phoneNumber || "Not provided"}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gender
                </label>
                <p className="flex items-center space-x-2 text-foreground bg-muted px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatGender(user.gender)}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Account Status
                </label>
                <p className="flex items-center space-x-2 text-foreground bg-muted px-3 py-2 rounded-lg">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      user.verified ||
                      user.isVerified ||
                      user.isOfficiallyEnabled
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <span>
                    {user.verified ||
                    user.isVerified ||
                    user.isOfficiallyEnabled
                      ? "Verified"
                      : "Pending Verification"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
