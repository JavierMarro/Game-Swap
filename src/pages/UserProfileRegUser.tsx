import React, { useState, useEffect } from "react";
import {
  getDocs,
  query,
  where,
  collection,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/hooks/useAuth";
import {
  updateUserDetails,
  getUserDetails,
} from "@/services/userDetailsService";
import { FaPencil } from "react-icons/fa6";
import { FaXbox } from "react-icons/fa";
import { BsNintendoSwitch } from "react-icons/bs";
import { FaPlaystation } from "react-icons/fa";
import Wishlist from "@/components/Wishlist";
// push again
export type UserProfileRegUser = {
  firstName: string;
  lastName: string;
  location: string;
  avatarUrl: string;
  gamesOwned: number;
  gamesLent: number;
  gamesBorrowed: number;
  platforms: string[];
  nickname: string;
  aboutMe: string;
  userId: string;
};

const UserProfileRegUser: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileRegUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const q = query(
          collection(db, "user details"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const userDocId = querySnapshot.docs[0].id;

          console.log("User UID:", user?.uid);
          console.log("User Profile Document ID:", userDocId);
          console.log("User Data:", userData);

          setProfile({ ...userData, id: userDocId });
        } else {
          console.log("No user found with that ID");
        }
      };
      fetchUserProfile();
    }
  }, [user]);
  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Xbox Series X/S":
        return <FaXbox className="text-xl text-green-600" />;
      case "PlayStation 5":
        return <FaPlaystation className="text-xl text-blue-600" />;
      case "Switch":
        return <BsNintendoSwitch className="text-xl text-red-600" />;
      default:
        return null;
    }
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handlePlatformChange = (platform: string) => {
    const updatedPlatforms = profile!.platforms.includes(platform)
      ? profile!.platforms.filter((p) => p !== platform)
      : [...profile!.platforms, platform];

    setProfile({ ...profile!, platforms: updatedPlatforms });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile!,
      location: e.target.value,
    });
  };

  const handleAboutMeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProfile({
      ...profile!,
      aboutMe: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    if (profile && profile.id) {
      try {
        const updatedProfile = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          location: profile.location,
          avatarUrl: profile.avatarUrl,
          platforms: profile.platforms,
          nickname: profile.nickname,
          aboutMe: profile.aboutMe || "",
        };

        await updateUserDetails(profile.id, updatedProfile);
        setIsEditing(false);

        console.log("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      console.error("Profile or Profile ID is missing!");
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200 mt-12">
        <div className="relative h-48">
          <img
            src={profile.avatarUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute -bottom-12 left-6">
            <img
              src={profile.avatarUrl}
              alt="Profile"
              className="w-24 h-24 rounded-xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          </div>
        </div>

        <div className="relative pt-16 px-6 pb-6 flex flex-col md:flex-row gap-6">
          {/* User Info */}
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.nickname}
            </h1>

            <p className="mt-5 text-gray-600 dark:text-gray-300">
              {profile.firstName} {profile.lastName}
            </p>

            {isEditing ? (
              <input
                type="text"
                value={profile.location}
                onChange={handleLocationChange}
                className="mt-2 p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-purple-600 dark:text-purple-400">
                {profile.location}
              </p>
            )}
          </div>

          {/* Games & Platforms */}
          <div className="flex flex-col text-gray-600 dark:text-gray-300 flex-1">
            <p className="mt-6">Games Owned: {profile.gamesOwned}</p>
            <p className="mt-0.5">Games Lent: {profile.gamesLent}</p>
            <p className="mt-0.5">Games Borrowed: {profile.gamesBorrowed}</p>

            <div className="mt-2 flex space-x-2">
              {profile.platforms.map((platform, index) => (
                <span key={index} className="mr-1">
                  {renderPlatformIcon(platform)}
                </span>
              ))}
            </div>

            {/* Edit platforms */}
            {isEditing && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Select Platforms
                </h3>
                <div className="flex space-x-4 mt-2">
                  <div>
                    <input
                      type="checkbox"
                      id="xbox"
                      checked={profile.platforms.includes("Xbox Series X/S")}
                      onChange={() => handlePlatformChange("Xbox Series X/S")}
                    />
                    <label
                      htmlFor="xbox"
                      className="ml-2 text-gray-600 dark:text-gray-300"
                    >
                      Xbox Series X/S
                    </label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="playstation"
                      checked={profile.platforms.includes("PlayStation 5")}
                      onChange={() => handlePlatformChange("PlayStation 5")}
                    />
                    <label
                      htmlFor="playstation"
                      className="ml-2 text-gray-600 dark:text-gray-300"
                    >
                      PlayStation 5
                    </label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="switch"
                      checked={profile.platforms.includes("Switch")}
                      onChange={() => handlePlatformChange("Switch")}
                    />
                    <label
                      htmlFor="switch"
                      className="ml-2 text-gray-600 dark:text-gray-300"
                    >
                      Switch
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit Profile - button */}
          <FaPencil
            className="cursor-pointer text-gray-600 dark:text-gray-300 absolute top-5 right-6"
            onClick={handleEditToggle}
          />
        </div>

        {/* About me */}
        <div className="mt-6 p-6 bg-gray-200 dark:bg-purple-900 text-gray-700 dark:text-purple-300">
          <h2 className="font-semibold">About Me</h2>
          {isEditing ? (
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Write something about yourself"
              value={profile.aboutMe}
              onChange={handleAboutMeChange}
            />
          ) : (
            <p>{profile.aboutMe}</p>
          )}
        </div>

        {/* Save Changes */}
        {isEditing && (
          <div className="mt-4">
            <button
              className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-md"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          </div>
        )}
        <Wishlist userId={user?.uid}></Wishlist>
      </div>
    </>
  );
};

export default UserProfileRegUser;
