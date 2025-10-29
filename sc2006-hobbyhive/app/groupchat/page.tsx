"use client";
import React, { useEffect, useState, useRef , useMemo} from "react";
import { createClient } from "../../utils/supabase/client";
import Navbar from "../components/Navbar";


const Page = () => {
  const supabase = useMemo(() => createClient(), []);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [groupChats, setGroupChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [membersFetched, setMembersFetched] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  

  // fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  //fetch user groupchats, title & img
  useEffect(() => {
    
    if (!userId) return;
    const fetchGroupChats = async () => {

      const {data, error} = await supabase
      .from ("group_chat_members")
      .select(`group_chats:chat_id (
        id,
        events:event_id (
          id,
          title,
          image_url
        )
      )
    `)
      .eq("user_id",userId);
      
    if (error) {
      console.log("Error fetching group chats: ", error.message);
      return;
    }
    
    const chats = (data as unknown as any[]).map((item) => {
      const event = item.group_chats?.events;
      return {
        chat_id:item.group_chats.id,
        event_title: event?.title ?? "unnamed Event",
        image_url:event?.image_url ?? "/placeholder.png",
      };
    });

    setGroupChats(chats);
    }
    fetchGroupChats();
  }, [userId])
 
  //fetch groupchatmembers
  const fetchMembers = async () => {
  
    if(!selectedChatId) return;
    const {data, error} = await supabase
    .from("group_chat_members")
    .select("user_id, profiles:user_id(username)")
    .eq("chat_id",selectedChatId);

    if (error) {
      console.error("error fetching members", error.message);
      return;
    }
    console.log("fetched members:", JSON.stringify(data, null, 2));
    console.log("current user:", userId);
    setGroupMembers(data || []);
  };

  //reset 
  useEffect(() => {
    setGroupMembers([]);
    setMembersFetched(false);
    setShowMembers(false);

  }, [selectedChatId])

  useEffect(() => {
    
    if(showMembers && selectedChatId && !membersFetched) {
      fetchMembers();
      setMembersFetched(true);
    }
},[showMembers,selectedChatId]);

  // fetch existing messages
  useEffect(() => {
    if (!selectedChatId) return;
    setMessages([]);
    const fetchMsgs = async () => {

      const { data, error } = await supabase
        .from("messages")
        .select("id, chat_id, sender_id, content, created_at, profiles:sender_id(username)")
        .eq("chat_id", selectedChatId)
        .order("created_at", { ascending: true });

        if (error) {
          console.error("Fetch error:", error.message);
        } else if (data) {
          setMessages(data);  
        }
  };

  fetchMsgs();
}, [selectedChatId]);

  //fetch host id
  useEffect(() => {
    setHostId(null);
    if (!selectedChatId) return;

    const fetchHost = async () => {
      const { data, error } = await supabase
      .from("group_chats")
      .select(`id,
        events(host_id)`)
        .eq("id",selectedChatId)
        .single();

        if (error) {
          console.log("error fetching host: ",error.message);
          return;
        }

        setHostId((data as any)?.events?.host_id ?? null);
      
    };

    fetchHost();

  }, [selectedChatId])


  //real time updates
  useEffect(() => {
    if (!selectedChatId) return;
    const channel = supabase
    .channel(`chat_${selectedChatId}`)
    .on("postgres_changes",
      {event:"INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${selectedChatId}`},
      async (payload) => {
        const {data:profile} = await supabase
        .from("profiles")
        .select("username") 
        .eq("id",payload.new.sender_id)
        .single();

        setMessages((prev) => [...prev, {...payload.new, profiles: profile}]);
      }
    )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
      
    };
  }, [selectedChatId]);


  // auto-scroll when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  // send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    const USER_ID = user.id;

    const { error } = await supabase.from("messages").insert([
      {
        chat_id: selectedChatId,
        sender_id: USER_ID,
        content: input,
      },
    ]);
    setInput("");
    if (error) console.error("Insert error:", error.message, error.details, error.hint);

  };
  
  const handleLeave = async () => {
    if (!selectedChatId || !userId) return;
    
    const { error } = await supabase
    .from("group_chat_members")
    .delete()
    .eq("chat_id",selectedChatId)
    .eq("user_id", userId);

    if (error) {
      console.error("error leaving group: ", error.message);
    } else {
      setGroupMembers((prev) => prev.filter((m) => m.id !== userId)); // remove from current members

      setGroupChats((prev) => prev.filter((c) => c.chat_id !== selectedChatId)); //remove group from sidebar

      setSelectedChatId(null); //clear selected
    } 
  };
  
  const handleRemove = async (memberId: string) => {
    if (!selectedChatId) return;

    const { error } = await supabase
    .from("group_chat_members")
    .delete()
    .eq("chat_id", selectedChatId)
    .eq("user_id", memberId);

    if (error) {
      console.error("error removing member: ", error.message);
    } else {
      setGroupMembers((prev) => prev.filter((m) => m.user_id !== memberId));
    }

  }
    
  

  return (
    <div className="h-screen flex flex-col p-2">
      {/* header */}
      <div className="flex flex-row px-2">
        <span>
          <Navbar />
        </span>
        <div className="text-5xl flex-1 text-center text-cyan-300">HobbyHive</div>
        <div className="w-[40px]" />
      </div>

      {/* layout */}
      <div className="Chat p-0 gap-4 flex flex-row flex-1 overflow-hidden">
        {/* sidebar groups */}
        <ul className="list bg-base-100 rounded-box shadow-md p-5 w-1/4 overflow-y-auto">
          {groupChats.length > 0? (
            groupChats.map((chat => (
              <li key = {chat.chat_id} className="flex items-center gap-3 py-6 text-white hover:bg-accent rounded-xl" 
              onClick ={() => setSelectedChatId(chat.chat_id)}>
                 <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full font-bold">
                    <img 
                    src={chat.img_url}
                    alt={chat.event_title}
                    className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                <div className="size-10 width-full break-words w-[150px]">
                  {chat.event_title}
                </div>
              </li>
            )))

          ):(<div className="text-white text-xl">No chats yet... <br></br>Join an event!</div>)}
        </ul>

        {/* chat room */}
        <div className="Chatroom border-1 border-base-400 p-2 flex flex-col flex-1 rounded-2xl h-full">
          <div className="flex justify-end mb-2">
            <div className="flex flex-col items-end mb-2 text-white">
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="btn btn-sm btn-outline btn-accent bg-accent text-black"
              >
                👥 {showMembers ? "Hide Members" : "View Members"}
              </button>

              {/* show member list */}
              {showMembers && (
                <div className="bg-base-200 rounded-lg p-3 mt-3 w-full transition-shadow duration-300">
                  {groupMembers.length > 0 ? (
                    groupMembers.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-base-300 rounded-lg p-2 mb-2">
                        <span className="px-5">{m.profiles?.username}</span>
                      
                        {m.user_id === userId && userId !== hostId && (
                          <button onClick={() => handleLeave()}
                          className="btn btn-xs btn-error">
                            leave
                          </button>
                        )}

                        {hostId === userId && m.user_id !== hostId && (
                          <button
                             onClick={ () => handleRemove(m.user_id)}
                             className="btn btn-xs btn-error">
                              remove
                             </button>
                        )}
                        
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      {membersFetched ? "No members found..." : "Loading members..."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 p-2 space-y-4 rounded-lg overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div key={idx}>
                  <div className={`${msg.sender_id === userId ? "chat chat-start" : "chat chat-end"}`}>
                    <div className="chat chat-header">{msg.profiles?.username}</div>
                    <p className="chat-bubble">{msg.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No messages yet...</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* input bar */}
          <div className="flex p-2 gap-4 items-end w-full text-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (input.trim() !== "") handleSend();
                }
              }}
              placeholder="Enter your message..."
              className="input input-bordered w-full"
            />
            <button onClick={handleSend} className="btn btn-accent rounded-xl font-bold">
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
