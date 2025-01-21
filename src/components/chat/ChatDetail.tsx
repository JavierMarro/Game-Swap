import { LucideChevronUp } from "lucide-react";
import { CardContent } from "../ui/Card";

function ChatDetail() {
  return (
    <CardContent className="flex-1 p-0">
      <div className="p-7 flex flex-col items-center gap-5 border-b-2">
        <img
          className="w-24 h-24 rounded-lg object-cover"
          src="https://t3.ftcdn.net/jpg/01/12/43/90/360_F_112439016_DkgjEftsYWLvlYtyl7gVJo1H9ik7wu1z.jpg"
          alt=""
        />
        <h2 className="font-semibold text-2xl">Jane Doe</h2>
        <p className="text-sm font-light text-slate-600">Lorem ipsum</p>
      </div>
      <div className="p-5 flex flex-col gap-7">
        <div>
          <div>
            <div className="flex items-center justify-between">
              <span>Details</span>
              <LucideChevronUp className="w-7 h-7 p-2 rounded-full cursor-pointer bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  );
}

export default ChatDetail;
