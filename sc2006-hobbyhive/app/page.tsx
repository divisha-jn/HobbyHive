import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Header from "./components/header";

export default function Home() {
  return (
    <main>
      <Header />
      <div>

        <Link href="/profile">my profile</Link>
        <br />
        <Link href="/events">Events</Link>
        <br />
        <Link href="/groupchat" className="p-20">temporary route to gc</Link> 
        <br />
        <Link href="/admin">temporary admin controls</Link> 
      </div>
      </main>
  );
}

