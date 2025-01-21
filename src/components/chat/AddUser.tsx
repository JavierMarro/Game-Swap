import { LucideMinus, LucidePlus, LucideSearch, X } from "lucide-react";
import { Button } from "../ui/Button";
import { FormEvent, useState } from "react";
import { Input } from "../ui/Input";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/hooks/useAuth";

interface User {
  avatarUrl?: string;
  nickname: string;
  userId: string;
}

function AddUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[] | null>(null);

  const { user } = useAuth();


  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const nickname = formData.get("nickname") as string;

    try {
      const userRef = collection(db, "user details");

      const q = query(
        userRef,
        where("nickname", ">=", nickname),
        where("nickname", "<=", nickname + "\uf8ff")
      );

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        const matchingUsers = querySnapShot.docs.map<User>(
          (doc) => doc.data() as User
        );
        setUsers(matchingUsers);
        console.log(users);
      } else {
        setUsers(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleAdd = async (otherUserId: string) => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, { createdAt: serverTimestamp(), messages: [] });

      await updateDoc(doc(userChatsRef, otherUserId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user?.uid,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, user?.uid), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: otherUserId,
          updatedAt: Date.now(),
        }),
      });

    } catch (error) {
      console.error("Error adding chat:", error);
    }
  };

  return (
    <>
      <button onClick={handleOpen}>
        {!isOpen ? <LucidePlus /> : <LucideMinus />}
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white bg-opacity-90 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Start Chat</h2>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <section className="p-6 pl-1">
              <form
                className="flex justify-between items-center gap-3"
                onSubmit={handleSearch}
              >
                <div className="flex w-full">
                  <LucideSearch
                    className="relative left-7 bottom-5 transform translate-y-[1.85rem] text-muted-foreground"
                    size={22}
                  />
                  <Input
                    className="w-full pl-10 pr-4"
                    type="search"
                    name="nickname"
                    placeholder="Search users"
                  />
                </div>
                <Button>Search</Button>
              </form>
              <div className="overflow-scroll h-96">
                {users &&
                  users.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between gap-5 p-5 pr-0 cursor-pointer border-b-2"
                    >
                      <div className="flex items-center gap-5">
                        <img
                          className="w-12 h-12 rounded-lg object-cover"
                          src={
                            user.avatarUrl ||
                            "https://t3.ftcdn.net/jpg/01/12/43/90/360_F_112439016_DkgjEftsYWLvlYtyl7gVJo1H9ik7wu1z.jpg"
                          }
                        />
                        <span className="font-semibold">{user.nickname}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={"default"}
                          onClick={() => handleAdd(user.userId)}
                        >
                          Add User
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

export default AddUser;
