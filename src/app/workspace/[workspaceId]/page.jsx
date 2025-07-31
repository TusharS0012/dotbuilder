"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import Chat from "@/components/Chat";
import Editor from "@/components/Editor";
import SearchBar from "@/components/Searchbar";
import { MessageCircle, Menu, PanelLeftOpen } from "lucide-react"; // Chat & Menu icons
import Header from "@/components/Header";
import ShowMembers from "@/components/Members";
import LiveCursor from "@/components/LiveCursor";
import NavPanel from "@/components/Navpanel";

const Workspace = () => {
  const { workspaceId } = useParams(); // Get workspaceId from URL
  const [selectedFile, setSelectedFile] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [membersCount, setMembersCount] = useState(0); // Not used directly in this snippet, but kept
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) return;

      const workspaceRef = doc(db, "workspaces", workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);

      if (workspaceSnap.exists()) {
        const workspaceData = workspaceSnap.data();
        setWorkspaceName(workspaceData.name);

        const membersRef = collection(db, `workspaces/${workspaceId}/members`);
        const membersSnap = await getDocs(membersRef);
        setMembersCount(membersSnap.size);
      } else {
        console.error("Workspace not found");
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900 min-w-[1024px] relative">
      {" "}
      {/* Main background to light gray, text to dark */}
      {/* Header (Assuming Header component adapts or is styled separately) */}
      <Header workspaceId={workspaceId} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* File Panel Toggle */}
        <button
          className="absolute top-1 left-4 z-20 p-2 hover:bg-gray-200 rounded" // Adjusted hover background
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <PanelLeftOpen
            size={24}
            className="h-7 w-7 text-gray-600 hover:text-gray-900 transition-colors" // Adjusted icon color
          />
        </button>

        {/* Left Side - File & Folder Panel */}
        <nav
          className={`transition-all duration-300 ${
            isNavOpen ? "w-[20%]" : "w-0"
          } overflow-hidden bg-white border-r border-gray-200 flex flex-col h-full shadow-md`} // White background, light border, added shadow
        >
          {isNavOpen && (
            <NavPanel workspaceId={workspaceId} openFile={setSelectedFile} />
          )}
        </nav>

        {/* Main - Editor Content */}
        <main className="flex-1 h-full flex flex-col py-2 overflow-auto bg-gray-50">
          <div className="flex h-[6%] gap-12 items-center justify-between border-b border-gray-200 pb-2 mb-2">
            <h1 className="text-2xl w-[40%] text-center font-mono ml-32 text-gray-800">
              Workspace: <span className="text-blue-600">{workspaceName}</span>
            </h1>
            <div className="flex items-center gap-4 ">
              <div className="flex items-start bg-blue-100 ring-1 ring-blue-300 px-4 py-1 rounded-md gap-2">
                {" "}
                <SearchBar workspaceId={workspaceId} />{" "}
              </div>
              <span className="text-lg text-gray-700 bg-gray-200 px-4 py-2 rounded-full flex items-center justify-center gap-3 shadow-sm">
                <ShowMembers workspaceId={workspaceId} />
              </span>
            </div>
          </div>

          <Editor file={selectedFile} />
        </main>
      </div>
      <aside
        className={`fixed bottom-0 right-0 transition-all duration-300 bg-white border-t border-gray-200 shadow-lg ${
          isChatOpen ? "h-[82%]" : "h-0"
        } overflow-hidden w-[45%]`}
      >
        {isChatOpen && (
          <Chat
            workspaceId={workspaceId}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
          />
        )}
      </aside>
      {!isChatOpen && (
        <button
          className="fixed bottom-6 right-10 z-30 py-3 font-mono px-5 flex items-center gap-2 text-xl bg-teal-100 ring-1 ring-teal-400 text-teal-800 rounded-full shadow-lg hover:bg-teal-200 animate-bounce" /* Light teal background, teal ring, dark teal text, subtle hover, bounce */
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageCircle className="h-8 w-8 text-teal-700" /> AI-Chat{" "}
        </button>
      )}
      <LiveCursor workspaceId={workspaceId} />{" "}
    </div>
  );
};

export default Workspace;
