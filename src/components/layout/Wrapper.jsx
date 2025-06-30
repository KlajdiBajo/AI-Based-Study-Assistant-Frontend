import { useEffect, useState } from "react";
import { Navbar, Sidebar } from "../layout";
import { useAuthStore } from "../../store";
import { api } from "../../lib";

const Wrapper = ({ children }) => {
  const { user: authUser } = useAuthStore();
  const [fullProfile, setFullProfile] = useState(null);

  // ✅ Fetch complete profile data to ensure navbar and profile page show same data
  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        const response = await api.get("/api/v1/profile/myProfile");
        setFullProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile in Wrapper:", error);
        // Fallback to auth user data
        setFullProfile(authUser);
      }
    };

    if (authUser) {
      fetchFullProfile();
    }
  }, [authUser]);

  const user = fullProfile || authUser;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar user={user} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Wrapper;