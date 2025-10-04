import React from 'react'
    import { createClient } from "../../utils/supabase/client";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ListingCard from '../components/ListingCard';


const page = () => {
  return (
    <div>
    <div className="flex flex-row w-full ">
        <span><Navbar/></span>

        <div className="text-5xl flex-1 text-center text-cyan-300">HobbyHive</div>
          <div className="w-[40px]" /> 

    </div>
        <span>
            <button className="btn btn-accent rounded-xl font-bold">send</button>
        </span>

        
        
    </div>
  )
}

export default page;
